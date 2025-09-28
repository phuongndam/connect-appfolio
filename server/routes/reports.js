const express = require('express');
const router = express.Router();
const appfolioService = require('../services/appfolioService');

// Lấy báo cáo tổng quan
router.get('/overview', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required',
        message: 'Please provide start_date and end_date parameters'
      });
    }

    // Lấy danh sách properties
    const properties = await appfolioService.getProperties();
    const overview = {
      total_properties: properties.data?.length || 0,
      total_units: 0,
      occupied_units: 0,
      vacant_units: 0,
      total_revenue: 0,
      properties: []
    };

    // Tính toán thống kê cho mỗi property
    for (const property of properties.data || []) {
      try {
        const units = await appfolioService.getPropertyUnits(property.id);
        const occupancyReport = await appfolioService.getOccupancyReport(property.id);
        const financialReport = await appfolioService.getFinancialReports(property.id, start_date, end_date);

        const propertyStats = {
          id: property.id,
          name: property.name,
          address: property.address,
          total_units: units.data?.length || 0,
          occupied_units: occupancyReport.data?.occupied_units || 0,
          vacant_units: occupancyReport.data?.vacant_units || 0,
          occupancy_rate: occupancyReport.data?.occupancy_rate || 0,
          revenue: financialReport.data?.total_revenue || 0
        };

        overview.total_units += propertyStats.total_units;
        overview.occupied_units += propertyStats.occupied_units;
        overview.vacant_units += propertyStats.vacant_units;
        overview.total_revenue += propertyStats.revenue;
        overview.properties.push(propertyStats);
      } catch (error) {
        console.warn(`Failed to fetch data for property ${property.id}:`, error.message);
      }
    }

    // Tính tỷ lệ occupancy tổng
    overview.overall_occupancy_rate = overview.total_units > 0 
      ? (overview.occupied_units / overview.total_units) * 100 
      : 0;

    res.json({
      success: true,
      data: overview,
      message: 'Overview report generated successfully'
    });
  } catch (error) {
    console.error('Error generating overview report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate overview report'
    });
  }
});

// Lấy báo cáo tài chính tổng hợp
router.get('/financial', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date are required',
        message: 'Please provide start_date and end_date parameters'
      });
    }

    const properties = await appfolioService.getProperties();
    const financialSummary = {
      total_revenue: 0,
      total_expenses: 0,
      net_income: 0,
      properties: []
    };

    for (const property of properties.data || []) {
      try {
        const financialReport = await appfolioService.getFinancialReports(property.id, start_date, end_date);
        
        const propertyFinancial = {
          id: property.id,
          name: property.name,
          revenue: financialReport.data?.total_revenue || 0,
          expenses: financialReport.data?.total_expenses || 0,
          net_income: (financialReport.data?.total_revenue || 0) - (financialReport.data?.total_expenses || 0)
        };

        financialSummary.total_revenue += propertyFinancial.revenue;
        financialSummary.total_expenses += propertyFinancial.expenses;
        financialSummary.properties.push(propertyFinancial);
      } catch (error) {
        console.warn(`Failed to fetch financial data for property ${property.id}:`, error.message);
      }
    }

    financialSummary.net_income = financialSummary.total_revenue - financialSummary.total_expenses;

    res.json({
      success: true,
      data: financialSummary,
      message: 'Financial report generated successfully'
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate financial report'
    });
  }
});

// Lấy báo cáo occupancy tổng hợp
router.get('/occupancy', async (req, res) => {
  try {
    const properties = await appfolioService.getProperties();
    const occupancySummary = {
      total_units: 0,
      occupied_units: 0,
      vacant_units: 0,
      overall_occupancy_rate: 0,
      properties: []
    };

    for (const property of properties.data || []) {
      try {
        const units = await appfolioService.getPropertyUnits(property.id);
        const occupancyReport = await appfolioService.getOccupancyReport(property.id);

        const propertyOccupancy = {
          id: property.id,
          name: property.name,
          total_units: units.data?.length || 0,
          occupied_units: occupancyReport.data?.occupied_units || 0,
          vacant_units: occupancyReport.data?.vacant_units || 0,
          occupancy_rate: occupancyReport.data?.occupancy_rate || 0
        };

        occupancySummary.total_units += propertyOccupancy.total_units;
        occupancySummary.occupied_units += propertyOccupancy.occupied_units;
        occupancySummary.vacant_units += propertyOccupancy.vacant_units;
        occupancySummary.properties.push(propertyOccupancy);
      } catch (error) {
        console.warn(`Failed to fetch occupancy data for property ${property.id}:`, error.message);
      }
    }

    occupancySummary.overall_occupancy_rate = occupancySummary.total_units > 0 
      ? (occupancySummary.occupied_units / occupancySummary.total_units) * 100 
      : 0;

    res.json({
      success: true,
      data: occupancySummary,
      message: 'Occupancy report generated successfully'
    });
  } catch (error) {
    console.error('Error generating occupancy report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate occupancy report'
    });
  }
});

module.exports = router;
