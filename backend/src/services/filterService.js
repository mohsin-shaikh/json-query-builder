const _ = require('lodash');
const JSONStream = require('JSONStream');
const fs = require('node:fs');
const path = require('node:path');

class FilterService {
    constructor() {
        this.operators = {
            '=': (a, b) => a === b,
            '!=': (a, b) => a !== b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
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

    parseCondition(condition) {
        const operators = Object.keys(this.operators).join('|');
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
        const conditions = [];
        let currentGroup = [];
        let groupOperator = 'AND';
        
        // Split by AND/OR while preserving parentheses
        const parts = query.split(/\s+(AND|OR)\s+/);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            if (part === 'AND' || part === 'OR') {
                groupOperator = part;
                continue;
            }
            
            // Remove parentheses
            const cleanPart = part.replace(/[()]/g, '');
            const condition = this.parseCondition(cleanPart);
            currentGroup.push(condition);
            
            if (i === parts.length - 1 || parts[i + 1] === 'AND' || parts[i + 1] === 'OR') {
                conditions.push({
                    conditions: currentGroup,
                    operator: groupOperator
                });
                currentGroup = [];
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
                        let groupResult = group.conditions[0] ? 
                            this.evaluateCondition(item, group.conditions[0]) : true;
                            
                        for (let i = 1; i < group.conditions.length; i++) {
                            const conditionResult = this.evaluateCondition(item, group.conditions[i]);
                            groupResult = this.operators[group.operator](groupResult, conditionResult);
                        }
                        
                        matches = this.operators.AND(matches, groupResult);
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