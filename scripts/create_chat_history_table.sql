-- Tạo bảng chat_history
CREATE TABLE IF NOT EXISTS public.chat_history (
    id SERIAL NOT NULL,
    name_app VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    user_id INTEGER NULL,
    session_id VARCHAR(255) NULL,
    timestamp TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT chat_history_pkey PRIMARY KEY (id),
    CONSTRAINT fk_chat_history_user FOREIGN KEY (user_id) REFERENCES public.users (id)
) TABLESPACE pg_default;

-- Tạo index cho hiệu suất
CREATE INDEX IF NOT EXISTS idx_chat_history_name_app ON public.chat_history(name_app);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON public.chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_history table
CREATE POLICY "Users can view their own chat history" ON public.chat_history
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own chat history" ON public.chat_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all chat history" ON public.chat_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_history_updated_at
    BEFORE UPDATE ON public.chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
