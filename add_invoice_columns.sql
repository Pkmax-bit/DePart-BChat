-- Migration to add missing columns to invoices table
-- Add sales_employee_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'sales_employee_id') THEN
        ALTER TABLE invoices ADD COLUMN sales_employee_id VARCHAR(50);
    END IF;
END $$;

-- Add id_congtrinh column if it doesn't exist (using the user's naming convention)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'id_congtrinh') THEN
        ALTER TABLE invoices ADD COLUMN id_congtrinh BIGINT REFERENCES cong_trinh(id);
    END IF;
END $$;

-- Add commission_percentage column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'commission_percentage') THEN
        ALTER TABLE invoices ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 5.0;
    END IF;
END $$;

-- Create index on id_congtrinh if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'invoices' AND indexname = 'idx_invoices_id_congtrinh') THEN
        CREATE INDEX idx_invoices_id_congtrinh ON public.invoices USING btree (id_congtrinh);
    END IF;
END $$;

-- Add loai_san_pham column to invoice_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoice_items' AND column_name = 'loai_san_pham') THEN
        ALTER TABLE invoice_items ADD COLUMN loai_san_pham VARCHAR(50) DEFAULT 'tu_bep';
    END IF;
END $$;

-- Add id_loaiphukien and id_phukien columns to invoice_items if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoice_items' AND column_name = 'id_loaiphukien') THEN
        ALTER TABLE invoice_items ADD COLUMN id_loaiphukien VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoice_items' AND column_name = 'id_phukien') THEN
        ALTER TABLE invoice_items ADD COLUMN id_phukien VARCHAR(50);
    END IF;
END $$;