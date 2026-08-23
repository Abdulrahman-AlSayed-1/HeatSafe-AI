-- Create worksites table
CREATE TABLE worksites (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timezone VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    worksite_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    exposure_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_tasks_worksite FOREIGN KEY (worksite_id) REFERENCES worksites(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_worksite_id ON tasks(worksite_id);
CREATE INDEX idx_tasks_start_time ON tasks(start_time);
