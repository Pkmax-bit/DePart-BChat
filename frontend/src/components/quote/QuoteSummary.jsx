import React from 'react';
import { Save } from 'lucide-react';

const QuoteSummary = ({
  selectedBophans,
  invoiceItems,
  bophanList,
  calculateTotal,
  saveInvoice
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {selectedBophans.length > 0 || invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Tóm tắt báo giá</h3>
          <div className="space-y-4">
            {/* Hiển thị sản phẩm tủ bếp */}
            {selectedBophans.map(bophanId => {
              const bophan = bophanList.find(b => b.id === bophanId);
              if (!bophan) return null;

              // Find the invoice item for this department
              const item = invoiceItems.find(item => item.id_bophan === bophanId);
              if (!item || !item.sanpham) return null;

              const totalPrice = item.thanh_tien || 0;

              return (
                <div key={bophanId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-black">{item.sanpham.tensp}</h4>
                      <p className="text-sm text-gray-700">Bộ phận: {bophan.tenloai}</p>
                      <p className="text-xs text-blue-600">Loại: Tủ bếp</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {totalPrice.toLocaleString('vi-VN')} VND
                      </p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.so_luong || 0}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700 font-medium">Kích thước thực tế:</span>
                      <p className="font-medium text-black">{item.ngang} x {item.cao} x {item.sau} mm</p>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Diện tích thực tế:</span>
                      <p className="font-medium text-black">{(item.dien_tich_thuc_te || 0).toLocaleString('vi-VN')} mm²</p>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Tỉ lệ:</span>
                      <p className="font-medium text-black">{(item.ti_le * 100 || 0).toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Chiết khấu:</span>
                      <p className="font-medium text-red-600">{item.chiet_khau || 0}%</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hiển thị phụ kiện bếp */}
            {invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-black">{item.phukien?.tenphukien || 'Phụ kiện'}</h4>
                    <p className="text-sm text-gray-700">Loại: {item.loaiphukien?.tenloai || 'Phụ kiện bếp'}</p>
                    <p className="text-xs text-purple-600">Loại: Phụ kiện bếp</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {item.thanh_tien.toLocaleString('vi-VN')} VND
                    </p>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.so_luong}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-700 font-medium">Thương hiệu:</span>
                    <p className="font-medium text-black">{item.phukien?.thuong_hieu || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Kích thước:</span>
                    <p className="font-medium text-black">{item.phukien?.kich_thuoc || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Công suất:</span>
                    <p className="font-medium text-black">{item.phukien?.cong_suat || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Chiết khấu:</span>
                    <p className="font-medium text-red-600">{item.chiet_khau || 0}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-black">Tóm tắt</h4>
                <p className="text-sm text-gray-700">
                  {selectedBophans.length} bộ phận tủ bếp • {invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').length} phụ kiện bếp • {invoiceItems.reduce((sum, item) => sum + (item.so_luong || 0), 0)} sản phẩm
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {calculateTotal().toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveInvoice}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Lưu báo giá</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuoteSummary;