const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/run', async (req, res) => {
  try {
    const { lidar_id, models } = req.body;

    // Trigger AI service
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/detect`, {
      lidar_id,
      models
    });

    // Update database
    await pool.query(
      'INSERT INTO detection_jobs (lidar_id, models, status) VALUES ($1, $2, $3)',
      [lidar_id, JSON.stringify(models), 'processing']
    );

    res.json({ success: true, job_id: response.data.job_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:job_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM detection_jobs WHERE id = $1',
      [req.params.job_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
