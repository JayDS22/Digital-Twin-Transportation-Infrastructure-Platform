const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class LidarController {
  async uploadFile(req, res) {
    try {
      const { project_id } = req.body;
      const { filename, size, path } = req.file;

      const result = await pool.query(
        'INSERT INTO lidar_files (filename, project_id, size, file_path, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [filename, project_id, size, path, 'uploaded']
      );

      logger.info(`LiDAR file uploaded: ${filename}`);
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      logger.error(`Upload error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async getFile(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM lidar_files WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json({ data: result.rows[0] });
    } catch (error) {
      logger.error(`Get file error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllFiles(req, res) {
    try {
      const { project_id, status, limit = 100 } = req.query;
      let query = 'SELECT * FROM lidar_files WHERE 1=1';
      const params = [];

      if (project_id) {
        params.push(project_id);
        query += ` AND project_id = $${params.length}`;
      }

      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);
      res.json({ data: result.rows, count: result.rows.length });
    } catch (error) {
      logger.error(`Get all files error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM lidar_files WHERE id = $1', [id]);
      logger.info(`LiDAR file deleted: ${id}`);
      res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      logger.error(`Delete error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new LidarController();
