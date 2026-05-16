-- Add fee_type and remarks columns to support specific fee categories
ALTER TABLE fee_records ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'Tuition';
ALTER TABLE fee_records ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE fee_schedules ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'Tuition';
ALTER TABLE fee_schedules ADD COLUMN IF NOT EXISTS remarks TEXT;
