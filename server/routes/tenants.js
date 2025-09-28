const express = require('express');
const router = express.Router();
const appfolioService = require('../services/appfolioService');

// Lấy danh sách tenants
router.get('/', async (req, res) => {
  try {
    const { status, property_id, limit = 50, offset = 0 } = req.query;
    
    const filters = {
      status,
      property_id,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const tenants = await appfolioService.getTenants(filters);
    
    res.json({
      success: true,
      data: tenants,
      message: 'Tenants fetched successfully'
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

// Lấy tenants của một property cụ thể
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.query;
    
    const filters = {
      property_id: propertyId,
      status
    };

    const tenants = await appfolioService.getTenants(filters);
    
    res.json({
      success: true,
      data: tenants,
      message: 'Property tenants fetched successfully'
    });
  } catch (error) {
    console.error(`Error fetching tenants for property ${req.params.propertyId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch property tenants'
    });
  }
});

module.exports = router;
