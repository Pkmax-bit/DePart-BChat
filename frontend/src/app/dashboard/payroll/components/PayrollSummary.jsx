import { FileText, Users, Clock, Package, DollarSign, TrendingUp } from 'lucide-react';

export default function PayrollSummary({ summaryStats, selectedPeriod }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Tóm tắt lương tháng {selectedPeriod}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
              <p className="text-lg font-bold text-gray-900">{summaryStats.totalEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Bảng chấm công</p>
              <p className="text-lg font-bold text-gray-900">{summaryStats.totalTimesheets || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Lương sản phẩm</p>
              <p className="text-lg font-bold text-gray-900">{summaryStats.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng lương</p>
              <p className="text-lg font-bold text-gray-900">{(summaryStats.totalSalary || 0).toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Lương trung bình</p>
            <p className="text-2xl font-bold text-blue-600">
              {summaryStats.totalEmployees > 0
                ? ((summaryStats.totalSalary || 0) / summaryStats.totalEmployees).toLocaleString('vi-VN')
                : 0} VND
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tổng giờ OT</p>
            <p className="text-2xl font-bold text-green-600">{summaryStats.totalOT || 0} giờ</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Lương sản phẩm</p>
            <p className="text-2xl font-bold text-purple-600">
              {(summaryStats.productSalary || 0).toLocaleString('vi-VN')} VND
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Đã cập nhật
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Dữ liệu lương tháng {selectedPeriod} đã được tính toán và cập nhật
        </p>
      </div>
    </div>
  );
}