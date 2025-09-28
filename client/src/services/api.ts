import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  status: string;
  total_units?: number;
  occupied_units?: number;
  vacant_units?: number;
  occupancy_rate?: number;
}

export interface Unit {
  id: string;
  property_id: string;
  property_name?: string;
  property_address?: string;
  unit_number: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  rent_amount: number;
  status: string;
  tenant_id?: string;
}

export interface Tenant {
  id: string;
  property_id: string;
  unit_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  move_in_date: string;
  lease_end_date: string;
  status: string;
}

export interface OverviewReport {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_revenue: number;
  overall_occupancy_rate: number;
  properties: Property[];
}

export interface FinancialReport {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  properties: Array<{
    id: string;
    name: string;
    revenue: number;
    expenses: number;
    net_income: number;
  }>;
}

export interface OccupancyReport {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  overall_occupancy_rate: number;
  properties: Array<{
    id: string;
    name: string;
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
  }>;
}

// API functions
export const propertyAPI = {
  getAll: (filters?: { status?: string; property_type?: string; limit?: number; offset?: number }) =>
    api.get('/properties', { params: filters }),
  
  getById: (id: string) =>
    api.get(`/properties/${id}`),
  
  getUnits: (id: string) =>
    api.get(`/properties/${id}/units`),
  
  getOccupancy: (id: string) =>
    api.get(`/properties/${id}/occupancy`),
  
  getFinancial: (id: string, startDate: string, endDate: string) =>
    api.get(`/properties/${id}/financial`, { params: { start_date: startDate, end_date: endDate } }),
};

export const unitAPI = {
  getAll: (filters?: { status?: string; property_id?: string; limit?: number; offset?: number }) =>
    api.get('/units', { params: filters }),
  
  getByProperty: (propertyId: string, status?: string) =>
    api.get(`/units/property/${propertyId}`, { params: { status } }),
};

export const tenantAPI = {
  getAll: (filters?: { status?: string; property_id?: string; limit?: number; offset?: number }) =>
    api.get('/tenants', { params: filters }),
  
  getByProperty: (propertyId: string, status?: string) =>
    api.get(`/tenants/property/${propertyId}`, { params: { status } }),
};

export const reportAPI = {
  getOverview: (startDate: string, endDate: string) =>
    api.get('/reports/overview', { params: { start_date: startDate, end_date: endDate } }),
  
  getFinancial: (startDate: string, endDate: string) =>
    api.get('/reports/financial', { params: { start_date: startDate, end_date: endDate } }),
  
  getOccupancy: () =>
    api.get('/reports/occupancy'),
};

export default api;
