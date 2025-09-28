const express = require('express');
const router = express.Router();
const appfolioService = require('../services/appfolioService');

// Lấy danh sách units từ tất cả properties
router.get('/', async (req, res) => {
  try {
    const { status, property_id, limit = 50, offset = 0 } = req.query;
    
    const filters = {
      status,
      property_id,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Lấy danh sách properties trước
    const properties = await appfolioService.getProperties();
    const allUnits = [];

    // Lấy units từ mỗi property
    for (const property of properties.data || []) {
      try {
        const units = await appfolioService.getPropertyUnits(property.id);
        if (units.data) {
          allUnits.push(...units.data.map(unit => ({
            ...unit,
            property_name: property.name,
            property_address: property.address
          })));
        }
      } catch (error) {
        console.warn(`Failed to fetch units for property ${property.id}:`, error.message);
      }
    }

    // Apply filters
    let filteredUnits = allUnits;
    if (filters.status) {
      filteredUnits = filteredUnits.filter(unit => unit.status === filters.status);
    }
    if (filters.property_id) {
      filteredUnits = filteredUnits.filter(unit => unit.property_id === filters.property_id);
    }

    // Pagination
    const startIndex = parseInt(filters.offset);
    const endIndex = startIndex + parseInt(filters.limit);
    const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedUnits,
      total: filteredUnits.length,
      limit: filters.limit,
      offset: filters.offset,
      message: 'Units fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch units'
    });
  }
});

// Lấy units của một property cụ thể
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.query;
    
    const units = await appfolioService.getPropertyUnits(propertyId);
    let filteredUnits = units.data || [];

    if (status) {
      filteredUnits = filteredUnits.filter(unit => unit.status === status);
    }

    res.json({
      success: true,
      data: filteredUnits,
      message: 'Property units fetched successfully'
    });
  } catch (error) {
    console.error(`Error fetching units for property ${req.params.propertyId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch property units'
    });
  }
});

module.exports = router;
