import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign, Clock, Package } from 'lucide-react';

export default function PayrollCharts({ payrollData, summaryStats, selectedPeriod }) {
  // Sample data for charts - in real app, this would come from API
  const salaryTrendData = [
    { month: '2024-08', salary: 150000000, employees: 25 },
    { month: '2024-09', salary: 165000000, employees: 26 },
    { month: '2024-10', salary: 158000000, employees: 25 },
    { month: '2024-11', salary: 172000000, employees: 27 },
    { month: selectedPeriod, salary: summaryStats.totalSalary || 0, employees: summaryStats.totalEmployees || 0 }
  ];

  const departmentData = [
    { name: 'Kinh doanh', value: 35, employees: 9 },
    { name: 'Kỹ thuật', value: 25, employees: 6 },
    { name: 'Hành chính', value: 20, employees: 5 },
    { name: 'Marketing', value: 20, employees: 5 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Biểu đồ thống kê</h2>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Xu hướng lương theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salaryTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(value) => [`${value.toLocaleString('vi-VN')} VND`, 'Tổng lương']}
                labelFormatter={(label) => `Tháng ${label}`}
              />
              <Area
                type="monotone"
                dataKey="salary"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
            Phân bố nhân viên theo phòng ban
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Lương trung bình</p>
              <p className="text-2xl font-bold text-blue-900">
                {summaryStats.totalEmployees > 0
                  ? ((summaryStats.totalSalary || 0) / summaryStats.totalEmployees).toLocaleString('vi-VN')
                  : 0} VND
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Tổng OT tháng</p>
              <p className="text-2xl font-bold text-green-900">
                {summaryStats.totalOT || 0} giờ
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Lương sản phẩm</p>
              <p className="text-2xl font-bold text-purple-900">
                {(summaryStats.productSalary || 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}