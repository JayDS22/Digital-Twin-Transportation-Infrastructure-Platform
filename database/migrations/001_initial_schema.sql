-- Initial schema migration
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS lidar_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    project_id VARCHAR(100),
    size BIGINT,
    file_path TEXT,
    status VARCHAR(50) DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    project_id VARCHAR(100),
    lidar_file_id INTEGER REFERENCES lidar_files(id),
    confidence FLOAT,
    verified BOOLEAN DEFAULT FALSE,
    geom GEOMETRY(Point, 4326),
    elevation FLOAT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_geom ON assets USING GIST(geom);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_project ON assets(project_id);
