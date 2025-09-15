import { Award } from 'lucide-react';

export default function ProfitSummary({ summaryStats, selectedPeriod }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Award className="w-5 h-5 mr-2 text-yellow-600" />
        Tóm tắt tổng thể tháng {selectedPeriod}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{summaryStats.invoiceCount}</p>
          <p className="text-sm text-gray-600">Tổng hóa đơn</p>
          <p className="text-xs text-gray-500 mt-1">
            Trung bình: {(summaryStats.invoiceCount > 0 ? summaryStats.totalRevenue / summaryStats.invoiceCount : 0).toLocaleString('vi-VN')} VND/đơn
          </p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{summaryStats.expenseCount}</p>
          <p className="text-sm text-gray-600">Tổng khoản chi phí</p>
          <p className="text-xs text-gray-500 mt-1">
            Trung bình: {(summaryStats.expenseCount > 0 ? summaryStats.totalExpenses / summaryStats.expenseCount : 0).toLocaleString('vi-VN')} VND/khoản
          </p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{summaryStats.productCount}</p>
          <p className="text-sm text-gray-600">Tổng sản phẩm</p>
          <p className="text-xs text-gray-500 mt-1">
            Trong kho
          </p>
        </div>
        <div className={`text-center p-4 rounded-lg ${summaryStats.totalProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
          <p className={`text-2xl font-bold ${summaryStats.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {summaryStats.profitMargin.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600">Tỷ suất lợi nhuận</p>
          <p className={`text-xs mt-1 ${summaryStats.profitMargin >= 20 ? 'text-green-600' : summaryStats.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
            {summaryStats.profitMargin >= 20 ? 'Xuất sắc' : summaryStats.profitMargin >= 10 ? 'Tốt' : 'Cần cải thiện'}
          </p>
        </div>
      </div>
    </div>
  );
}