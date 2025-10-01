import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const lidarAPI = {
  upload: (formData) => api.post('/lidar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/lidar'),
  getById: (id) => api.get(`/lidar/${id}`)
};

export const detectionAPI = {
  run: (data) => api.post('/detection/run', data),
  getStatus: (jobId) => api.get(`/detection/status/${jobId}`)
};

export const assetAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getSummary: () => api.get('/assets/summary'),
  getSpatial: (bbox, type) => api.get('/assets/spatial', { params: { bbox, type } })
};

export const analyticsAPI = {
  getCoverage: () => api.get('/analytics/coverage'),
  getPerformance: () => api.get('/analytics/performance'),
  getCrashes: () => api.get('/analytics/crashes')
};

export default api;
