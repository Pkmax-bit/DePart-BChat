-- Tạo bảng chatflows
CREATE TABLE IF NOT EXISTS chatflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    embed_url TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho hiệu suất
CREATE INDEX IF NOT EXISTS idx_chatflows_enabled ON chatflows(is_enabled);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chatflows_updated_at
    BEFORE UPDATE ON chatflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Chèn dữ liệu mẫu
INSERT INTO chatflows (name, embed_url, is_enabled) VALUES
('Chatbot Tổng Hợp', 'https://example.com/chatbot1', true),
('Chatbot Hỗ Trợ Kỹ Thuật', 'https://example.com/chatbot2', true)
ON CONFLICT DO NOTHING;
