-- Thêm cột ngan_sach_ke_hoach vào bảng cong_trinh
-- ngan_sach_ke_hoach = tổng invoices_quote + tổng chiphi_quote của công trình

ALTER TABLE public.cong_trinh
ADD COLUMN IF NOT EXISTS ngan_sach_ke_hoach numeric DEFAULT 0;

-- Tạo index cho hiệu suất
CREATE INDEX IF NOT EXISTS idx_cong_trinh_ngan_sach_ke_hoach ON public.cong_trinh USING btree (ngan_sach_ke_hoach) TABLESPACE pg_default;

-- Comment cho cột
COMMENT ON COLUMN public.cong_trinh.ngan_sach_ke_hoach IS 'Ngân sách kế hoạch = tổng invoices_quote + tổng chiphi_quote của công trình';