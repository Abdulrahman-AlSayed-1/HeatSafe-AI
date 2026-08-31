-- Migration V5: Ensure Dubai legacy seed records are purged and replace with US seed facilities
DELETE FROM tasks WHERE worksite_id IN (SELECT id FROM worksites WHERE name LIKE '%Dubai%');
DELETE FROM worksites WHERE name LIKE '%Dubai%';

-- Ensure Phoenix Industrial Hub exists as standard US seed worksite if not already present
INSERT INTO worksites (name, description, latitude, longitude, timezone, created_at, updated_at)
SELECT 'Phoenix Industrial Operations Hub', 
       'High-exposure open-air industrial and construction facility in Phoenix, Arizona', 
       33.4484, 
       -112.0740, 
       'America/Phoenix', 
       CURRENT_TIMESTAMP, 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM worksites WHERE name = 'Phoenix Industrial Operations Hub');
