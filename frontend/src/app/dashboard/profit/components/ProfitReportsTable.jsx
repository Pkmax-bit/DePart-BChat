import { FileText } from 'lucide-react';

export default function ProfitReportsTable({ allProfitData, selectedPeriod }) {
  if (allProfitData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        Báo cáo lợi nhuận tất cả các tháng
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tháng</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chi phí</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chi phí nhân sự</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi phí</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lợi nhuận</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tỷ suất (%)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hóa đơn</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chi phí</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allProfitData.slice().reverse().map((report, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${report.report_month === selectedPeriod ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.report_month}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600">
                  {report.total_revenue.toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">
                  {((report.total_expenses || 0) - (report.total_payroll_expenses || 0)).toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-orange-600">
                  {(report.total_payroll_expenses || 0).toLocaleString('vi-VN')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600">
                  {report.total_expenses.toLocaleString('vi-VN')}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${report.total_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {report.total_profit.toLocaleString('vi-VN')}
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-sm ${report.profit_margin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {report.profit_margin.toFixed(2)}%
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {report.invoice_count}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {report.expense_count}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {report.payroll_count || 0}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                  {report.product_count}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${report.total_profit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {report.total_profit >= 0 ? 'Lợi nhuận' : 'Lỗ'}
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