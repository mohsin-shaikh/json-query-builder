const _ = require('lodash');
const JSONStream = require('JSONStream');
const fs = require('node:fs');
const path = require('node:path');

class FilterService {
    constructor() {
        this.operators = {
            // Comparison operators
            '=': (a, b) => {
                if (a instanceof Date && b instanceof Date) {
                    return a.getTime() === b.getTime();
                }
                return a === b;
            },
            '!=': (a, b) => {
                if (a instanceof Date && b instanceof Date) {
                    return a.getTime() !== b.getTime();
                }
                return a !== b;
            },
            '>': (a, b) => {
                if (a instanceof Date && b instanceof Date) {
                    return a.getTime() > b.getTime();
                }
                return a > b;
            },
            '<': (a, b) => {
                if (a instanceof Date && b instanceof Date) {
                    return a.getTime() < b.getTime();
                }
                return a < b;
            },
            '>=': (a, b) => {
                if (a instanceof Date && b instanceof Date) {
                    return a.getTime() >= b.getTime();
                }
                return a >= b;
            },
            '<=': (a, b) => {
                if (a instanceof Date && b instanceof Date) {
                    return a.getTime() <= b.getTime();
                }
                return a <= b;
            },
            
            // String operators
            'LIKE': (a, b) => {
                if (typeof a !== 'string' || typeof b !== 'string') return false;
                const pattern = b.replace(/%/g, '.*').replace(/_/g, '.');
                const regex = new RegExp(`^${pattern}$`, 'i');
                return regex.test(a);
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
                    const regex = new RegExp(b, 'i');
                    return regex.test(a);
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
        let leftValue = _.get(item, left);
        
        // Convert ISO date strings to Date objects
        if (typeof leftValue === 'string' && !Number.isNaN(new Date(leftValue).getTime())) {
            leftValue = new Date(leftValue);
        }
        
        return this.operators[operator](leftValue, right);
    }

    parseQuery(query) {
        // Split the query into individual conditions and operators
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
            
            conditions.push({
                condition,
                operator: currentOperator
            });
        }

        return conditions;
    }

    async filterData(filePath, query) {
        return new Promise((resolve, reject) => {
            const results = [];
            
            // If query is empty, return all records
            if (!query || query.trim() === '') {
                const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
                    .pipe(JSONStream.parse('*'))
                    .on('data', (item) => {
                        results.push(item);
                    })
                    .on('end', () => {
                        resolve(results);
                    })
                    .on('error', (error) => {
                        reject(error);
                    });
                return;
            }

            const conditions = this.parseQuery(query);
            
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
                .pipe(JSONStream.parse('*'))
                .on('data', (item) => {
                    let currentResult = true;
                    
                    for (let i = 0; i < conditions.length; i++) {
                        const { condition, operator } = conditions[i];
                        const conditionResult = this.evaluateCondition(item, condition);
                        
                        if (i === 0) {
                            currentResult = conditionResult;
                        } else {
                            if (operator === 'OR') {
                                currentResult = currentResult || conditionResult;
                            } else {
                                currentResult = currentResult && conditionResult;
                            }
                        }
                    }
                    
                    if (currentResult) {
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