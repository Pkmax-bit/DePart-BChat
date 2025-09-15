import { BarChart3, Target, FileText } from 'lucide-react';

export default function ProfitMetrics({ summaryStats, selectedPeriod, allProfitData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Monthly Performance */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Hiệu suất tháng {selectedPeriod}
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Số hóa đơn:</span>
            <span className="text-sm font-semibold text-blue-600">{summaryStats.invoiceCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Số chi phí:</span>
            <span className="text-sm font-semibold text-red-600">{summaryStats.expenseCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Sản phẩm:</span>
            <span className="text-sm font-semibold text-purple-600">{summaryStats.productCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lợi nhuận/Hóa đơn:</span>
            <span className="text-sm font-semibold text-green-600">
              {summaryStats.invoiceCount > 0 ? (summaryStats.totalProfit / summaryStats.invoiceCount).toLocaleString('vi-VN') : 0} VND
            </span>
          </div>
        </div>
      </div>

      {/* Profit Analysis */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          Phân tích lợi nhuận
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tỷ suất lợi nhuận:</span>
            <span className={`text-sm font-semibold ${summaryStats.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryStats.profitMargin.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Chi phí/Doanh thu:</span>
            <span className="text-sm font-semibold text-orange-600">
              {summaryStats.totalRevenue > 0 ? ((summaryStats.totalExpenses / summaryStats.totalRevenue) * 100).toFixed(2) : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <span className={`text-sm font-semibold ${summaryStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryStats.totalProfit >= 0 ? 'Có lãi' : 'Lỗ'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hiệu quả:</span>
            <span className={`text-sm font-semibold ${summaryStats.profitMargin >= 20 ? 'text-green-600' : summaryStats.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {summaryStats.profitMargin >= 20 ? 'Xuất sắc' : summaryStats.profitMargin >= 10 ? 'Tốt' : 'Cần cải thiện'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-purple-600" />
          Tổng quan dữ liệu
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tháng báo cáo:</span>
            <span className="text-sm font-semibold text-gray-900">{allProfitData.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tháng có lãi:</span>
            <span className="text-sm font-semibold text-green-600">
              {allProfitData.filter(report => report.total_profit >= 0).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tháng lỗ:</span>
            <span className="text-sm font-semibold text-red-600">
              {allProfitData.filter(report => report.total_profit < 0).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tỷ lệ thành công:</span>
            <span className="text-sm font-semibold text-blue-600">
              {allProfitData.length > 0 ? ((allProfitData.filter(report => report.total_profit >= 0).length / allProfitData.length) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}