import { FileText, Users, DollarSign, Calendar } from 'lucide-react';

export default function PayrollReportsTable({ allPayrollData, selectedPeriod }) {
  if (!allPayrollData || allPayrollData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        Báo cáo lương tất cả các tháng
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tháng</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng lương</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lương TB</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lương sản phẩm</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giờ OT</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allPayrollData.slice().reverse().map((report, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${report.ky_tinh_luong === selectedPeriod ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.ky_tinh_luong}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-blue-600">
                  {report.employee_count || 0}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
                  {(report.total_salary || 0).toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-purple-600">
                  {report.employee_count > 0 ? ((report.total_salary || 0) / report.employee_count).toLocaleString('vi-VN') : 0}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-orange-600">
                  {(report.product_salary || 0).toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {report.total_ot_hours || 0}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (report.completion_rate || 0) >= 100
                      ? 'bg-green-100 text-green-800'
                      : (report.completion_rate || 0) > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(report.completion_rate || 0) >= 100 ? 'Hoàn thành' : (report.completion_rate || 0) > 0 ? 'Đang xử lý' : 'Chưa xử lý'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}