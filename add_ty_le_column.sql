-- Migration to add ty_le column to luong_san_pham table
-- This column represents the commission rate (percentage) for product sales

ALTER TABLE public.luong_san_pham
ADD COLUMN IF NOT EXISTS ty_le DECIMAL(5,2) DEFAULT 0;

-- Update the thanh_tien calculation to include commission
-- Commission = (so_luong * don_gia) * (ty_le / 100)
-- But since thanh_tien is a generated column, we need to drop and recreate it

ALTER TABLE public.luong_san_pham
DROP COLUMN IF EXISTS thanh_tien;

ALTER TABLE public.luong_san_pham
ADD COLUMN thanh_tien DECIMAL(15,2) GENERATED ALWAYS AS (
    (so_luong * don_gia) + ((so_luong * don_gia) * (ty_le / 100))
) STORED;

-- Add comment for the new column
COMMENT ON COLUMN public.luong_san_pham.ty_le IS 'Tỷ lệ hoa hồng (%) cho sản phẩm';