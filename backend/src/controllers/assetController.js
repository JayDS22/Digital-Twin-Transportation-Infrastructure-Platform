const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class AssetController {
  async getAssets(req, res) {
    try {
      const { type, project_id, verified, limit = 1000, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM assets WHERE 1=1';
      const params = [];

      if (type) {
        params.push(type);
        query += ` AND type = $${params.length}`;
      }

      if (project_id) {
        params.push(project_id);
        query += ` AND project_id = $${params.length}`;
      }

      if (verified !== undefined) {
        params.push(verified === 'true');
        query += ` AND verified = $${params.length}`;
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      res.json({ data: result.rows, count: result.rows.length });
    } catch (error) {
      logger.error(`Get assets error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async getSummary(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          type,
          COUNT(*) as detected,
          COUNT(CASE WHEN verified = true THEN 1 END) as verified,
          ROUND(AVG(confidence * 100)::numeric, 0) as accuracy
        FROM assets
        GROUP BY type
        ORDER BY detected DESC
      `);

      res.json({ data: result.rows });
    } catch (error) {
      logger.error(`Get summary error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async createAsset(req, res) {
    try {
      const { type, project_id, lidar_file_id, confidence, latitude, longitude, elevation, metadata } = req.body;

      const result = await pool.query(
        `INSERT INTO assets (type, project_id, lidar_file_id, confidence, geom, elevation, metadata) 
         VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8) 
         RETURNING *`,
        [type, project_id, lidar_file_id, confidence, longitude, latitude, elevation, metadata]
      );

      logger.info(`Asset created: ${type}`);
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      logger.error(`Create asset error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async updateAsset(req, res) {
    try {
      const { id } = req.params;
      const { verified, metadata } = req.body;

      const result = await pool.query(
        'UPDATE assets SET verified = $1, metadata = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [verified, metadata, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      logger.error(`Update asset error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAsset(req, res) {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM assets WHERE id = $1', [id]);
      logger.info(`Asset deleted: ${id}`);
      res.json({ success: true, message: 'Asset deleted' });
    } catch (error) {
      logger.error(`Delete asset error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AssetController();
