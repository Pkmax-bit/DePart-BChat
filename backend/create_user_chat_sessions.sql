-- Tạo bảng để lưu trữ session state của user với chatflow
CREATE TABLE IF NOT EXISTS user_chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    chatflow_id INTEGER NOT NULL,
    conversation_id VARCHAR(255),
    session_data JSONB,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_user_chat_sessions_user
        FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_chat_sessions_chatflow
        FOREIGN KEY (chatflow_id) REFERENCES chatflows(id) ON DELETE CASCADE,

    -- Unique constraint để đảm bảo mỗi user chỉ có một session với mỗi chatflow
    CONSTRAINT unique_user_chatflow UNIQUE (user_id, chatflow_id)
);

-- Tạo index để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_user_id ON user_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_chatflow_id ON user_chat_sessions(chatflow_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_sessions_last_accessed ON user_chat_sessions(last_accessed);
