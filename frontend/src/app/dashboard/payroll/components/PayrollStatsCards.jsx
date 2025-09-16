import { Users, Clock, Package, DollarSign, TrendingUp, TrendingDown, Target, Award } from 'lucide-react';

export default function PayrollStatsCards({ summaryStats, selectedPeriod }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
            <p className="text-2xl font-bold text-blue-600">{summaryStats.totalEmployees || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Đang hoạt động</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Bảng chấm công</p>
            <p className="text-2xl font-bold text-green-600">{summaryStats.totalTimesheets || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Kỳ {selectedPeriod}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Package className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Lương sản phẩm</p>
            <p className="text-2xl font-bold text-yellow-600">{summaryStats.totalProducts || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Đã ghi nhận</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng lương</p>
            <p className="text-2xl font-bold text-purple-600">{(summaryStats.totalSalary || 0).toLocaleString('vi-VN')} VND</p>
            <p className="text-xs text-gray-500 mt-1">Kỳ {selectedPeriod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}