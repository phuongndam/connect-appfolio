const express = require('express');
const router = express.Router();
const appfolioService = require('../services/appfolioService');

// Lấy danh sách tất cả properties
router.get('/', async (req, res) => {
  try {
    const { status, property_type, limit = 50, offset = 0 } = req.query;
    
    const filters = {
      status,
      property_type,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const properties = await appfolioService.getProperties(filters);
    res.json({
      success: true,
      data: properties,
      message: 'Properties fetched successfully'
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

// Lấy chi tiết một property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await appfolioService.getProperty(id);
    
    res.json({
      success: true,
      data: property,
      message: 'Property details fetched successfully'
    });
  } catch (error) {
    console.error(`Error fetching property ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch property details'
    });
  }
});

// Lấy danh sách units của property
router.get('/:id/units', async (req, res) => {
  try {
    const { id } = req.params;
    const units = await appfolioService.getPropertyUnits(id);
    
    res.json({
      success: true,
      data: units,
      message: 'Property units fetched successfully'
    });
  } catch (error) {
    console.error(`Error fetching units for property ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch property units'
    });
  }
});

// Lấy báo cáo occupancy cho property
router.get('/:id/occupancy', async (req, res) => {
  try {
    const { id } = req.params;
    const occupancyReport = await appfolioService.getOccupancyReport(id);
    
    res.json({
      success: true,
      data: occupancyReport,
      message: 'Occupancy report fetched successfully'
    });
  } catch (error) {
    console.error(`Error fetching occupancy report for property ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch occupancy report'
    });
  }
});

// Lấy báo cáo tài chính cho property
router.get('/:id/financial', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required',
        message: 'Please provide start_date and end_date parameters'
      });
    }

    const financialReport = await appfolioService.getFinancialReports(id, start_date, end_date);
    
    res.json({
      success: true,
      data: financialReport,
      message: 'Financial report fetched successfully'
    });
  } catch (error) {
    console.error(`Error fetching financial report for property ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch financial report'
    });
  }
});

module.exports = router;
