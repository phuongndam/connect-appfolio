const express = require('express');
const router = express.Router();
const appfolioService = require('../services/appfolioService');

// Test endpoint đơn giản để lấy 1 property
router.get('/properties', async (req, res) => {
  try {
    console.log('Testing single properties call...');
    const response = await appfolioService.getProperties();
    
    res.json({
      success: true,
      data: response.data.slice(0, 5), // Chỉ lấy 5 properties đầu tiên
      total: response.data.length,
      message: `Found ${response.data.length} properties`
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch properties'
    });
  }
});

// Test endpoint để lấy 1 unit
router.get('/units/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log(`Testing units for property ${propertyId}...`);
    
    const response = await appfolioService.getPropertyUnits(propertyId);
    
    res.json({
      success: true,
      data: response.data.slice(0, 3), // Chỉ lấy 3 units đầu tiên
      total: response.data.length,
      message: `Found ${response.data.length} units for property ${propertyId}`
    });
  } catch (error) {
    console.error(`Error fetching units for property ${req.params.propertyId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch units'
    });
  }
});

// Test endpoint để lấy tenants
router.get('/tenants', async (req, res) => {
  try {
    console.log('Testing tenants call...');
    const response = await appfolioService.getTenants();
    
    res.json({
      success: true,
      data: response.data.slice(0, 5), // Chỉ lấy 5 tenants đầu tiên
      total: response.data.length,
      message: `Found ${response.data.length} tenants`
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch tenants'
    });
  }
});

module.exports = router;
