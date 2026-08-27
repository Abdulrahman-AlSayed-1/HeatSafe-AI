-- Insert seed worksite: Dubai Marina Construction Site
INSERT INTO worksites (name, description, latitude, longitude, timezone, created_at, updated_at)
VALUES (
    'Dubai Marina Construction Site',
    'Large-scale construction project in Dubai Marina with multiple work crews',
    25.08,
    55.14,
    'Asia/Dubai',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert seed tasks for Dubai Marina worksite (assuming worksite_id = 1)
INSERT INTO tasks (worksite_id, name, description, start_time, duration_minutes, exposure_type, created_at, updated_at)
VALUES 
    (1, 'Concrete Pouring', 'Foundation concrete pouring work', 
     (CURRENT_DATE + INTERVAL '8 hours'), 120, 'HIGH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (1, 'Steel Welding', 'Structural steel welding and fabrication', 
     (CURRENT_DATE + INTERVAL '10 hours 30 minutes'), 120, 'HIGH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (1, 'Excavation', 'Site excavation and earth moving', 
     (CURRENT_DATE + INTERVAL '13 hours'), 120, 'MODERATE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    (1, 'Equipment Operation', 'Heavy machinery operation', 
     (CURRENT_DATE + INTERVAL '15 hours 30 minutes'), 120, 'LOW', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
