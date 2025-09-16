-- Migration to rename don_gia to gia_thanh in luong_san_pham table
-- gia_thanh represents the cost price of goods

-- First, add the new gia_thanh column
ALTER TABLE public.luong_san_pham
ADD COLUMN IF NOT EXISTS gia_thanh DECIMAL(15,2);

-- Copy data from don_gia to gia_thanh
UPDATE public.luong_san_pham
SET gia_thanh = don_gia
WHERE gia_thanh IS NULL;

-- Drop the generated thanh_tien column
ALTER TABLE public.luong_san_pham
DROP COLUMN IF EXISTS thanh_tien;

-- Drop the old don_gia column
ALTER TABLE public.luong_san_pham
DROP COLUMN IF EXISTS don_gia;

-- Recreate thanh_tien with new calculation: so_luong * gia_thanh * (ty_le / 100)
ALTER TABLE public.luong_san_pham
ADD COLUMN thanh_tien DECIMAL(15,2) GENERATED ALWAYS AS (
    so_luong * gia_thanh * (ty_le / 100)
) STORED;

-- Add comment for the new column
COMMENT ON COLUMN public.luong_san_pham.gia_thanh IS 'Giá thành của hàng hóa';