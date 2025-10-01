-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- LiDAR files table
CREATE TABLE lidar_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    project_id VARCHAR(100),
    size BIGINT,
    status VARCHAR(50) DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table with spatial data
CREATE TABLE assets (
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

-- Spatial index
CREATE INDEX idx_assets_geom ON assets USING GIST(geom);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_project ON assets(project_id);

-- Detection jobs table
CREATE TABLE detection_jobs (
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

-- Crash data table
CREATE TABLE crash_data (
    id SERIAL PRIMARY KEY,
    crash_date DATE NOT NULL,
    severity INTEGER,
    geom GEOMETRY(Point, 4326),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crash_geom ON crash_data USING GIST(geom);
CREATE INDEX idx_crash_date ON crash_data(crash_date);

-- Coverage areas table
CREATE TABLE coverage_areas (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255),
    geom GEOMETRY(LineString, 4326),
    lidar_file_id INTEGER REFERENCES lidar_files(id),
    asset_id INTEGER REFERENCES assets(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coverage_geom ON coverage_areas USING GIST(geom);

-- Sample data
INSERT INTO lidar_files (filename, project_id, size, status) VALUES
('downtown_sector_a.las', 'project-001', 5242880000, 'processed'),
('highway_interchange.las', 'project-002', 3145728000, 'processed'),
('residential_zone.las', 'project-003', 4194304000, 'processing');

INSERT INTO assets (type, project_id, lidar_file_id, confidence, verified, geom, elevation) VALUES
('sidewalk', 'project-001', 1, 0.98, true, ST_SetSRID(ST_MakePoint(-76.9378, 38.9897), 4326), 50.0),
('road_sign', 'project-001', 1, 0.95, true, ST_SetSRID(ST_MakePoint(-76.9380, 38.9895), 4326), 52.5),
('curb_ramp', 'project-001', 1, 0.92, true, ST_SetSRID(ST_MakePoint(-76.9375, 38.9900), 4326), 50.2),
('traffic_light', 'project-002', 2, 0.96, true, ST_SetSRID(ST_MakePoint(-76.9385, 38.9890), 4326), 55.0);
