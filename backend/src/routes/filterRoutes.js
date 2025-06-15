const express = require('express');
const router = express.Router();
const filterService = require('../services/filterService');
const fieldSuggestionService = require('../services/fieldSuggestionService');
const path = require('node:path');

router.post('/filter', async (req, res) => {
    try {
        const { query = '', filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({
                error: 'Missing required parameter: filePath'
            });
        }

        const absolutePath = path.resolve(filePath);
        const results = await filterService.filterData(absolutePath, query);
        
        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/suggestions', async (req, res) => {
    try {
        const { searchTerm = '', filePath } = req.query;
        
        if (!filePath) {
            return res.status(400).json({
                error: 'Missing required parameter: filePath'
            });
        }

        const absolutePath = path.resolve(filePath);
        const suggestions = await fieldSuggestionService.getFieldSuggestions(absolutePath, searchTerm);
        
        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 