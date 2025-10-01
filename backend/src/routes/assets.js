const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/', async (req, res) => {
  try {
    const { type, project_id, limit = 1000 } = req.query;
    
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
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({ data: result.rows, count: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(confidence) as avg_confidence,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_count
      FROM assets
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/spatial', async (req, res) => {
  try {
    const { bbox, type } = req.query;
    
    // bbox format: minx,miny,maxx,maxy
    const [minx, miny, maxx, maxy] = bbox.split(',').map(Number);
    
    const result = await pool.query(`
      SELECT * FROM assets
      WHERE ST_Within(
        geom,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      ${type ? 'AND type = $5' : ''}
    `, type ? [minx, miny, maxx, maxy, type] : [minx, miny, maxx, maxy]);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
