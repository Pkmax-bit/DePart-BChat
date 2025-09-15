-- Migration to add missing columns to quanly_chiphi table
-- Add parent_id column for hierarchical expenses
ALTER TABLE quanly_chiphi ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES quanly_chiphi(id);

-- Add updated_at column for tracking updates
ALTER TABLE quanly_chiphi ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add ti_le column for storing percentage ratio of total expenses
ALTER TABLE quanly_chiphi ADD COLUMN IF NOT EXISTS ti_le DECIMAL(5,2) DEFAULT 0;

-- Create index for parent_id for better performance
CREATE INDEX IF NOT EXISTS idx_quanly_chiphi_parent_id ON quanly_chiphi(parent_id);

-- Create index for created_at for filtering by month
CREATE INDEX IF NOT EXISTS idx_quanly_chiphi_created_at ON quanly_chiphi(created_at);