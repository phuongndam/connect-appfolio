const express = require('express');
const router = express.Router();
const appfolioService = require('../services/appfolioService');

// Test endpoint để kiểm tra các report endpoints có sẵn
router.get('/reports', async (req, res) => {
  try {
    const testEndpoints = [
      '/properties.json',
      '/property.json',
      '/property_list.json',
      '/property_summary.json',
      '/units.json',
      '/tenants.json',
      '/rent_roll.json',
      '/income_statement.json',
      '/occupancy.json',
      '/delinquency.json'
    ];

    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await appfolioService.makeRequest(endpoint, 'POST', {
          property_visibility: "active",
          properties: {
            properties_ids: [],
            property_groups_ids: [],
            portfolios_ids: [],
            owners_ids: []
          }
        });
        
        results.push({
          endpoint,
          status: 'success',
          hasData: !!(response.results || response),
          dataLength: response.results ? response.results.length : (Array.isArray(response) ? response.length : 0)
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'error',
          error: error.response?.data?.message || error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: 'Report endpoints test completed'
    });
  } catch (error) {
    console.error('Error testing endpoints:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test endpoints'
    });
  }
});

module.exports = router;
