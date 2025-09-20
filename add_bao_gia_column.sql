-- Add bao_gia column to cong_trinh table
ALTER TABLE cong_trinh ADD COLUMN IF NOT EXISTS bao_gia numeric;