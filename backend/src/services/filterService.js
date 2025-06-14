const _ = require('lodash');
const JSONStream = require('JSONStream');
const fs = require('node:fs');
const path = require('node:path');

class FilterService {
    constructor() {
        this.operators = {
            // Comparison operators
            '=': (a, b) => a === b,
            '!=': (a, b) => a !== b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            
            // String operators
            'LIKE': (a, b) => {
                if (typeof a !== 'string' || typeof b !== 'string') return false;
                const pattern = b.replace(/%/g, '.*').replace(/_/g, '.');
                return new RegExp(`^${pattern}$`, 'i').test(a);
            },
            'NOT LIKE': (a, b) => !this.operators.LIKE(a, b),
            'CONTAINS': (a, b) => {
                if (typeof a !== 'string' || typeof b !== 'string') return false;
                return a.toLowerCase().includes(b.toLowerCase());
            },
            'NOT CONTAINS': (a, b) => !this.operators.CONTAINS(a, b),
            'REGEX': (a, b) => {
                if (typeof a !== 'string' || typeof b !== 'string') return false;
                try {
                    return new RegExp(b, 'i').test(a);
                } catch (e) {
                    return false;
                }
            },
            
            // List operators
            'IN': (a, b) => {
                if (!Array.isArray(b)) return false;
                return b.includes(a);
            },
            'NOT IN': (a, b) => !this.operators.IN(a, b),
            
            // Logical operators
            'AND': (a, b) => a && b,
            'OR': (a, b) => a || b
        };
    }

    parseValue(inputValue) {
        // Remove quotes if present
        const value = inputValue.trim().replace(/^['"]|['"]$/g, '');
        
        // Try to parse as number
        if (!Number.isNaN(Number(value))) {
            return Number(value);
        }
        
        // Try to parse as date
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date;
        }
        
        // Return as string
        return value;
    }

    parseListValue(inputValue) {
        // Remove brackets and split by comma
        const listStr = inputValue.trim().replace(/^\[|\]$/g, '');
        return listStr.split(',').map(item => this.parseValue(item.trim()));
    }

    parseCondition(condition) {
        // Handle special operators that need different parsing
        if (condition.includes(' IN ')) {
            const [left, right] = condition.split(' IN ');
            return {
                left: left.trim(),
                operator: 'IN',
                right: this.parseListValue(right)
            };
        }
        
        if (condition.includes(' NOT IN ')) {
            const [left, right] = condition.split(' NOT IN ');
            return {
                left: left.trim(),
                operator: 'NOT IN',
                right: this.parseListValue(right)
            };
        }

        // Handle other operators
        const operators = Object.keys(this.operators)
            .filter(op => !['IN', 'NOT IN'].includes(op))
            .join('|');
        const regex = new RegExp(`(.*?)\\s*(${operators})\\s*(.*)`);
        const match = condition.match(regex);
        
        if (!match) {
            throw new Error(`Invalid condition format: ${condition}`);
        }

        const [, left, operator, right] = match;
        return {
            left: left.trim(),
            operator: operator.trim(),
            right: this.parseValue(right)
        };
    }

    evaluateCondition(item, condition) {
        const { left, operator, right } = condition;
        const leftValue = _.get(item, left);
        return this.operators[operator](leftValue, right);
    }

    parseQuery(query) {
        // First, split by logical operators while preserving parentheses
        const parts = query.split(/\s+(AND|OR)\s+/);
        const conditions = [];
        let currentOperator = 'AND';

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            if (part === 'AND' || part === 'OR') {
                currentOperator = part;
                continue;
            }

            // Remove parentheses
            const cleanPart = part.replace(/[()]/g, '');
            const condition = this.parseCondition(cleanPart);
            
            if (i === 0) {
                // First condition
                conditions.push({
                    conditions: [condition],
                    operator: currentOperator
                });
            } else {
                // Add to existing group if same operator, create new group if different
                const lastGroup = conditions[conditions.length - 1];
                if (lastGroup.operator === currentOperator) {
                    lastGroup.conditions.push(condition);
                } else {
                    conditions.push({
                        conditions: [condition],
                        operator: currentOperator
                    });
                }
            }
        }

        return conditions;
    }

    async filterData(filePath, query) {
        return new Promise((resolve, reject) => {
            const results = [];
            const conditions = this.parseQuery(query);
            
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
                .pipe(JSONStream.parse('*'))
                .on('data', (item) => {
                    let matches = true;
                    
                    for (const group of conditions) {
                        let groupResult = false;
                        
                        // For OR groups, we need at least one condition to be true
                        if (group.operator === 'OR') {
                            groupResult = group.conditions.some(condition => 
                                this.evaluateCondition(item, condition)
                            );
                        } else {
                            // For AND groups, all conditions must be true
                            groupResult = group.conditions.every(condition => 
                                this.evaluateCondition(item, condition)
                            );
                        }
                        
                        // Combine with previous results using AND
                        matches = matches && groupResult;
                    }
                    
                    if (matches) {
                        results.push(item);
                    }
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }
}

module.exports = new FilterService(); 