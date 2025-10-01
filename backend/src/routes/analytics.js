const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/coverage', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        project_name,
        ST_Length(ST_Union(geom)::geography) / 1609.34 as miles,
        COUNT(DISTINCT lidar_file_id) as file_count,
        COUNT(DISTINCT asset_id) as asset_count
      FROM coverage_areas
      GROUP BY project_name
    `);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/performance', async (req, res) => {
  try {
    const metrics = {
      load_time: 420,
      fps: 60,
      points_rendered: 52000000,
      api_latency: 85
    };

    res.json({ data: metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/crashes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', crash_date) as month,
        COUNT(*) as crashes,
        AVG(severity) as avg_severity
      FROM crash_data
      WHERE crash_date >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
