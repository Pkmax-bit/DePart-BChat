import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export default function ProfitCharts({ profitData, summaryStats, selectedPeriod }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Biểu đồ lợi nhuận tháng {selectedPeriod}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), '']} />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" name="Doanh thu" />
            <Bar dataKey="expenses" fill="#EF4444" name="Chi phí" />
            <Bar dataKey="profit" fill="#3B82F6" name="Lợi nhuận" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChartIcon className="w-5 h-5 mr-2 text-blue-600" />
          Tỷ lệ doanh thu vs chi phí
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Doanh thu', value: summaryStats.totalRevenue, color: '#10B981' },
                { name: 'Chi phí', value: summaryStats.totalExpenses, color: '#EF4444' }
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#10B981" />
              <Cell fill="#EF4444" />
            </Pie>
            <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}