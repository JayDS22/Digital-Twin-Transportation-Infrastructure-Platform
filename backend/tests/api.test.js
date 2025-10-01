const request = require('supertest');
const app = require('../src/server');

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('GET /api/assets/summary', () => {
    it('should return asset summary', async () => {
      const res = await request(app).get('/api/assets/summary');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
