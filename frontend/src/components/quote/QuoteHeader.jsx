import React from 'react';
import { FileText } from 'lucide-react';

const QuoteHeader = ({ calculateTotal, saveInvoice }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Báo giá Đơn hàng</h2>
        <p className="text-gray-600 mt-1">Tạo và quản lý đơn hàng báo giá</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">Tổng tiền</p>
          <p className="text-xl font-bold text-green-600">{calculateTotal().toLocaleString('vi-VN')} VND</p>
        </div>
        <button
          onClick={saveInvoice}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Lưu Đơn hàng</span>
        </button>
      </div>
    </div>
  );
};

export default QuoteHeader;