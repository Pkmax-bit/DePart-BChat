import { BarChart3, Target, FileText, Users, DollarSign, Clock } from 'lucide-react';

export default function PayrollMetrics({ summaryStats, selectedPeriod, allPayrollData }) {
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
            <span className="text-sm text-gray-600">Số nhân viên:</span>
            <span className="text-sm font-semibold text-blue-600">{summaryStats.totalEmployees}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Bảng chấm công:</span>
            <span className="text-sm font-semibold text-green-600">{summaryStats.totalTimesheets}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lương sản phẩm:</span>
            <span className="text-sm font-semibold text-purple-600">{summaryStats.totalProducts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lương/Nhân viên:</span>
            <span className="text-sm font-semibold text-orange-600">
              {summaryStats.totalEmployees > 0 ? (summaryStats.totalSalary / summaryStats.totalEmployees).toLocaleString('vi-VN') : 0} VND
            </span>
          </div>
        </div>
      </div>

      {/* Payroll Analysis */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          Phân tích lương
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng lương:</span>
            <span className="text-sm font-semibold text-blue-600">
              {summaryStats.totalSalary.toLocaleString('vi-VN')} VND
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lương sản phẩm:</span>
            <span className="text-sm font-semibold text-green-600">
              {summaryStats.productSalary.toLocaleString('vi-VN')} VND
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tổng giờ OT:</span>
            <span className="text-sm font-semibold text-orange-600">
              {summaryStats.totalOT} giờ
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tỷ lệ lương sản phẩm:</span>
            <span className="text-sm font-semibold text-purple-600">
              {summaryStats.totalSalary > 0 ? ((summaryStats.productSalary / summaryStats.totalSalary) * 100).toFixed(1) : 0}%
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
            <span className="text-sm text-gray-600">Tháng lương:</span>
            <span className="text-sm font-semibold text-gray-900">{allPayrollData?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Nhân viên active:</span>
            <span className="text-sm font-semibold text-green-600">
              {summaryStats.totalEmployees}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Phiếu lương:</span>
            <span className="text-sm font-semibold text-blue-600">
              {summaryStats.totalPayrolls || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tỷ lệ hoàn thành:</span>
            <span className="text-sm font-semibold text-indigo-600">
              {summaryStats.totalEmployees > 0 ? ((summaryStats.totalPayrolls || 0) / summaryStats.totalEmployees * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}