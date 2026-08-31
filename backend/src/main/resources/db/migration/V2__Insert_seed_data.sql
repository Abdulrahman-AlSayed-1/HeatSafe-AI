-- Insert seed worksite: Phoenix Industrial Operations Hub (USA)
INSERT INTO worksites (name, description, latitude, longitude, timezone, created_at, updated_at)
VALUES (
    'Phoenix Industrial Operations Hub',
    'High-exposure open-air industrial and construction facility in Phoenix, Arizona',
    33.4484,
    -112.0740,
    'America/Phoenix',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert seed tasks for Phoenix worksite (assuming worksite_id = 1)
INSERT INTO tasks (worksite_id, name, description, start_time, duration_minutes, exposure_type, worker_count, created_at, updated_at)
VALUES 
    (1, 'Concrete Pouring', 'Foundation concrete pouring work', 
     (CURRENT_DATE + INTERVAL '8 hours'), 120, 'HIGH', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (1, 'Steel Welding', 'Structural steel welding and fabrication', 
     (CURRENT_DATE + INTERVAL '10 hours 30 minutes'), 120, 'HIGH', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (1, 'Excavation', 'Site excavation and earth moving', 
     (CURRENT_DATE + INTERVAL '13 hours'), 120, 'MODERATE', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (1, 'Equipment Operation', 'Heavy machinery operation', 
     (CURRENT_DATE + INTERVAL '15 hours 30 minutes'), 120, 'LOW', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
