-- Script để cập nhật bảng activity_logs với các trường mới
-- Chạy script này trong Supabase SQL Editor

-- Thêm cột action_type nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'activity_logs'
                   AND column_name = 'action_type') THEN
        ALTER TABLE activity_logs ADD COLUMN action_type VARCHAR(50) DEFAULT 'access';
    END IF;
END $$;

-- Thêm cột online_status nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'activity_logs'
                   AND column_name = 'online_status') THEN
        ALTER TABLE activity_logs ADD COLUMN online_status BOOLEAN;
    END IF;
END $$;

-- Đổi tên cột 'online' thành 'online_status' nếu tồn tại
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'activity_logs'
               AND column_name = 'online')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'activity_logs'
                    AND column_name = 'online_status') THEN
        ALTER TABLE activity_logs RENAME COLUMN online TO online_status;
    END IF;
END $$;

-- Cập nhật các bản ghi cũ
UPDATE activity_logs
SET action_type = CASE
  WHEN chatflow_id = 0 THEN 'login'
  ELSE 'access'
END
WHERE action_type IS NULL OR action_type = '';

-- Tạo index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_access_time ON activity_logs(access_time DESC);
