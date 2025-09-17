import { TrendingUp, TrendingDown, DollarSign, Target, Users } from 'lucide-react';

export default function ProfitStatsCards({ summaryStats, selectedPeriod }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-600">{summaryStats.totalRevenue.toLocaleString('vi-VN')} VND</p>
            <p className="text-xs text-gray-500 mt-1">{summaryStats.invoiceCount || 0} hóa đơn</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-lg">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Chi phí</p>
            <p className="text-2xl font-bold text-red-600">{(summaryStats.totalExpenses - (summaryStats.totalPayrollExpenses || 0)).toLocaleString('vi-VN')} VND</p>
            <p className="text-xs text-gray-500 mt-1">{summaryStats.expenseCount || 0} khoản chi</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Chi phí nhân sự</p>
            <p className="text-2xl font-bold text-orange-600">{(summaryStats.totalPayrollExpenses || 0).toLocaleString('vi-VN')} VND</p>
            <p className="text-xs text-gray-500 mt-1">{summaryStats.payrollCount || 0} nhân viên</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${summaryStats.totalProfit >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
            <DollarSign className={`w-6 h-6 ${summaryStats.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Lợi nhuận</p>
            <p className={`text-2xl font-bold ${summaryStats.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {summaryStats.totalProfit.toLocaleString('vi-VN')} VND
            </p>
            <p className="text-xs text-gray-500 mt-1">Tháng {selectedPeriod}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tỷ suất lợi nhuận</p>
            <p className={`text-2xl font-bold ${summaryStats.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {summaryStats.profitMargin.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">{summaryStats.productCount || 0} sản phẩm</p>
          </div>
        </div>
      </div>
    </div>
  );
}