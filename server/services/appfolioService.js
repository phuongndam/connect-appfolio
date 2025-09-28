const axios = require('axios');

class AppFolioService {
  constructor() {
    this.clientId = process.env.APPFOLIO_CLIENT_ID;
    this.clientSecret = process.env.APPFOLIO_CLIENT_SECRET;
    this.databaseUrl = process.env.APPFOLIO_DATABASE_URL || 'teenterprise.appfolio.com';
    this.baseURL = `https://${this.clientId}:${this.clientSecret}@${this.databaseUrl}/api/v2/reports`;
    
    // Rate limiting
    this.requestQueue = [];
    this.requestCount = 0;
    this.windowStart = Date.now();
    this.maxRequests = 6; // Giữ lại 1 request để an toàn
    this.windowMs = 15000; // 15 seconds
  }

  // AppFolio Reports API sử dụng HTTP Basic Auth, không cần access token
  async getAccessToken() {
    // AppFolio Reports API sử dụng HTTP Basic Auth trực tiếp trong URL
    return null;
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.windowStart >= this.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }
    
    // If we've hit the limit, wait
    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.windowStart);
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.windowStart = Date.now();
      }
    }
    
    this.requestCount++;
  }

  // Tạo request với HTTP Basic Auth và rate limiting
  async makeRequest(endpoint, method = 'POST', data = null) {
    try {
      // Wait for rate limit
      await this.waitForRateLimit();
      
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      console.log(`Making ${method} request to: ${this.baseURL}${endpoint} (Request ${this.requestCount}/${this.maxRequests})`);
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limited. Waiting 15 seconds...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        // Reset counters
        this.requestCount = 0;
        this.windowStart = Date.now();
        // Retry once
        return this.makeRequest(endpoint, method, data);
      }
      console.error(`AppFolio API Error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  // Lấy danh sách properties từ Rent Roll Report
  async getProperties(filters = {}) {
    try {
      const requestData = {
        property_visibility: filters.status || "active",
        properties: {
          properties_ids: [],
          property_groups_ids: [],
          portfolios_ids: [],
          owners_ids: []
        }
      };

      console.log('Fetching properties from rent_roll.json...');
      const response = await this.makeRequest('/rent_roll.json', 'POST', requestData);
      
      // Rent Roll data chứa thông tin về units, chúng ta cần group theo property
      const rentRollData = response.results || response || [];
      console.log(`Received ${rentRollData.length} rent roll records`);
      
      // Group by property để tạo danh sách properties
      const propertiesMap = new Map();
      
      rentRollData.forEach(record => {
        const propertyId = record.property_id || record.property_id;
        if (propertyId && !propertiesMap.has(propertyId)) {
          propertiesMap.set(propertyId, {
            id: propertyId,
            name: record.property_name || record.property_name || `Property ${propertyId}`,
            address: record.property_address || record.property_address || '',
            city: record.property_city || record.property_city || '',
            state: record.property_state || record.property_state || '',
            zip: record.property_zip || record.property_zip || '',
            property_type: record.property_type || record.property_type || 'Unknown',
            status: record.property_status || record.property_status || 'active',
            total_units: 0,
            occupied_units: 0,
            vacant_units: 0,
            occupancy_rate: 0
          });
        }
        
        // Count units
        if (propertiesMap.has(propertyId)) {
          const property = propertiesMap.get(propertyId);
          property.total_units += 1;
          
          if (record.tenant_status === 'Current' || record.tenant_status === 'current') {
            property.occupied_units += 1;
          } else {
            property.vacant_units += 1;
          }
        }
      });
      
      // Calculate occupancy rates
      const properties = Array.from(propertiesMap.values()).map(property => ({
        ...property,
        occupancy_rate: property.total_units > 0 ? (property.occupied_units / property.total_units) * 100 : 0
      }));
      
      console.log(`Processed ${properties.length} properties from rent roll data`);
      
      return {
        data: properties,
        next_page_url: response.next_page_url
      };
    } catch (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  // Lấy chi tiết property (sử dụng Properties report với filter)
  async getProperty(propertyId) {
    try {
      const requestData = {
        property_visibility: "active",
        properties: {
          properties_ids: [propertyId],
          property_groups_ids: [],
          portfolios_ids: [],
          owners_ids: []
        }
      };

      const response = await this.makeRequest('/properties.json', 'POST', requestData);
      return {
        data: response.results?.[0] || null
      };
    } catch (error) {
      throw new Error(`Failed to fetch property ${propertyId}: ${error.message}`);
    }
  }

  // Lấy danh sách units từ Rent Roll Report
  async getPropertyUnits(propertyId) {
    try {
      const requestData = {
        property_visibility: "active",
        properties: {
          properties_ids: [propertyId],
          property_groups_ids: [],
          portfolios_ids: [],
          owners_ids: []
        }
      };

      console.log(`Fetching units for property ${propertyId} from rent_roll.json...`);
      const response = await this.makeRequest('/rent_roll.json', 'POST', requestData);
      
      const rentRollData = response.results || response || [];
      console.log(`Received ${rentRollData.length} rent roll records for property ${propertyId}`);
      
      // Filter và format units data
      const units = rentRollData
        .filter(record => record.property_id == propertyId)
        .map(record => ({
          id: record.unit_id || record.unit_id || `unit_${record.property_id}_${record.unit_number}`,
          property_id: record.property_id,
          property_name: record.property_name,
          property_address: record.property_address,
          unit_number: record.unit_number || record.unit_number || 'N/A',
          bedrooms: record.bedrooms || record.bedrooms || 0,
          bathrooms: record.bathrooms || record.bathrooms || 0,
          square_feet: record.square_feet || record.square_feet || 0,
          rent_amount: parseFloat(record.rent_amount || record.rent_amount || 0),
          status: record.tenant_status === 'Current' ? 'occupied' : 'vacant',
          tenant_id: record.tenant_id || record.tenant_id || null
        }));
      
      console.log(`Processed ${units.length} units for property ${propertyId}`);
      
      return {
        data: units
      };
    } catch (error) {
      throw new Error(`Failed to fetch units for property ${propertyId}: ${error.message}`);
    }
  }

  // Lấy danh sách tenants từ Rent Roll Report
  async getTenants(filters = {}) {
    try {
      const requestData = {
        property_visibility: "active",
        properties: {
          properties_ids: filters.property_id ? [filters.property_id] : [],
          property_groups_ids: [],
          portfolios_ids: [],
          owners_ids: []
        }
      };

      console.log('Fetching tenants from rent_roll.json...');
      const response = await this.makeRequest('/rent_roll.json', 'POST', requestData);
      
      const rentRollData = response.results || response || [];
      console.log(`Received ${rentRollData.length} rent roll records for tenants`);
      
      // Filter và format tenants data (chỉ lấy records có tenant info)
      const tenants = rentRollData
        .filter(record => record.tenant_id && record.tenant_status === 'Current')
        .map(record => ({
          id: record.tenant_id,
          property_id: record.property_id,
          unit_id: record.unit_id || record.unit_id,
          first_name: record.tenant_first_name || record.tenant_first_name || 'N/A',
          last_name: record.tenant_last_name || record.tenant_last_name || 'N/A',
          email: record.tenant_email || record.tenant_email || '',
          phone: record.tenant_phone || record.tenant_phone || '',
          move_in_date: record.move_in_date || record.move_in_date || '',
          lease_end_date: record.lease_end_date || record.lease_end_date || '',
          status: 'active'
        }));
      
      console.log(`Processed ${tenants.length} tenants from rent roll data`);
      
      return {
        data: tenants
      };
    } catch (error) {
      throw new Error(`Failed to fetch tenants: ${error.message}`);
    }
  }

  // Lấy báo cáo tài chính từ Income Statement report
  async getFinancialReports(propertyId, startDate, endDate) {
    try {
      const requestData = {
        property_visibility: "active",
        properties: {
          properties_ids: [propertyId],
          property_groups_ids: [],
          portfolios_ids: [],
          owners_ids: []
        },
        period_from: startDate,
        period_to: endDate
      };

      const response = await this.makeRequest('/income_statement.json', 'POST', requestData);
      return {
        data: response.results || []
      };
    } catch (error) {
      throw new Error(`Failed to fetch financial reports: ${error.message}`);
    }
  }

  // Lấy báo cáo occupancy từ Occupancy report
  async getOccupancyReport(propertyId) {
    try {
      const requestData = {
        property_visibility: "active",
        properties: {
          properties_ids: [propertyId],
          property_groups_ids: [],
          portfolios_ids: [],
          owners_ids: []
        }
      };

      const response = await this.makeRequest('/occupancy.json', 'POST', requestData);
      return {
        data: response.results || []
      };
    } catch (error) {
      throw new Error(`Failed to fetch occupancy report: ${error.message}`);
    }
  }
}

module.exports = new AppFolioService();
