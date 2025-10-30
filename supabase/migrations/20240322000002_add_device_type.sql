ALTER TABLE repair_logs ADD COLUMN IF NOT EXISTS device_type TEXT;

CREATE INDEX IF NOT EXISTS repair_logs_device_type_idx ON repair_logs(device_type);