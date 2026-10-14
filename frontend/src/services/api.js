import axios from 'axios';

// The backend API base URL is configurable via environment variables
// Note: We never expose ServiceNow credentials or secrets here!
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const equipmentService = {
  // Health endpoint
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Equipment list
  getEquipmentList: async () => {
    const res = await apiClient.get('/equipment');
    return res.data;
  },

  // Equipment metadata
  getEquipmentById: async (id) => {
    const res = await apiClient.get(`/equipment/${id}`);
    return res.data;
  },

  // Digital Twin overview for both devices
  getTwinsOverview: async () => {
    const res = await apiClient.get('/twin/overview');
    return res.data;
  },

  // Full snapshot for a specific equipment twin
  getTwinSnapshot: async (id) => {
    const res = await apiClient.get(`/twin/${id}`);
    return res.data;
  },

  // Telemetry history for charts
  getTelemetryHistory: async (id, limit = 40) => {
    const res = await apiClient.get(`/telemetry/${id}/history?limit=${limit}`);
    return res.data;
  },

  // Trigger on-demand simulated test packet
  triggerSimulation: async (id, scenario = 'normal') => {
    const res = await apiClient.post(`/telemetry/simulate/${id}?scenario=${scenario}`);
    return res.data;
  },

  // Submit maintenance request
  createMaintenanceRequest: async (requestData) => {
    const res = await apiClient.post('/twin/maintenance', requestData);
    return res.data;
  },

  // ServiceNow Integration Status & Connectivity
  getServiceNowStatus: async () => {
    const res = await apiClient.get('/servicenow/status');
    return res.data;
  },

  testServiceNowConnection: async () => {
    const res = await apiClient.post('/servicenow/test');
    return res.data;
  },

  syncServiceNowIncident: async (equipmentId) => {
    const res = await apiClient.post(`/servicenow/sync/${equipmentId}`);
    return res.data;
  },
};

export default apiClient;
