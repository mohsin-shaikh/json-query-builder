const fs = require('node:fs');
const JSONStream = require('JSONStream');
const _ = require('lodash');

class FieldSuggestionService {
    async getFieldSuggestions(filePath, searchTerm = '') {
        return new Promise((resolve, reject) => {
            const fields = new Set();
            
            const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
                .pipe(JSONStream.parse('*'))
                .on('data', (item) => {
                    // Get all root level fields
                    Object.keys(item).forEach(field => {
                        if (!searchTerm || field.toLowerCase().includes(searchTerm.toLowerCase())) {
                            fields.add(field);
                        }
                    });
                })
                .on('end', () => {
                    resolve(Array.from(fields).sort());
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }
}

module.exports = new FieldSuggestionService(); 