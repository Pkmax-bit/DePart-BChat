import { TrendingUp, TrendingDown } from 'lucide-react';

export default function ProfitTables({ revenueData, expenseData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Details */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Chi tiết doanh thu
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.slice(0, 5).map((inv, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{inv.customer_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inv.invoice_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                    {(inv.ngan_sach_ke_hoach || 0).toLocaleString('vi-VN')} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {revenueData.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có dữ liệu doanh thu</p>
          </div>
        )}
      </div>

      {/* Expense Details */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
          Chi tiết chi phí
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loại chi phí</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenseData.slice(0, 5).map((exp, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {exp.loaichiphi?.tenchiphi || 'N/A'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{exp.mo_ta || ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-red-600">
                    {(exp.giathanh || 0).toLocaleString('vi-VN')} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenseData.length === 0 && (
          <div className="text-center py-8">
            <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có dữ liệu chi phí</p>
          </div>
        )}
      </div>
    </div>
  );
}