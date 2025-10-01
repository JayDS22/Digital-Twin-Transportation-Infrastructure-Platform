
-- Add detection jobs table
CREATE TABLE IF NOT EXISTS detection_jobs (
    id SERIAL PRIMARY KEY,
    lidar_id INTEGER REFERENCES lidar_files(id),
    models JSONB,
    status VARCHAR(50) DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    results JSONB,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_detection_status ON detection_jobs(status);
CREATE INDEX idx_detection_lidar ON detection_jobs(lidar_id);

