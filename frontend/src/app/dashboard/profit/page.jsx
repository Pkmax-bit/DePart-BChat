'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar, BarChart3, PieChart as PieChartIcon, FileSpreadsheet, Printer, Eye, RefreshCw, Target, Award, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

const supabase = createClientComponentClient();

export default function ProfitPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    profitMargin: 0,
    revenueGrowth: 0,
    expenseGrowth: 0
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        await loadData();
      }
    };
    getUser();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Load profit report data from single endpoint
      const profitResponse = await fetch(`http://localhost:8001/api/v1/accounting/profit/?month=${selectedPeriod}`, {
        headers
      });

      if (profitResponse.ok) {
        const profitData = await profitResponse.json();

        setRevenueData(profitData.details.revenue || []);
        setExpenseData(profitData.details.expenses || []);
        setProfitData([{
          month: selectedPeriod,
          revenue: profitData.summary.total_revenue,
          expenses: profitData.summary.total_expenses,
          profit: profitData.summary.total_profit,
          profitMargin: profitData.summary.profit_margin
        }]);
        setSummaryStats({
          totalRevenue: profitData.summary.total_revenue,
          totalExpenses: profitData.summary.total_expenses,
          totalProfit: profitData.summary.total_profit,
          profitMargin: profitData.summary.profit_margin,
          revenueGrowth: 0,
          expenseGrowth: 0
        });
      } else {
        console.error('Error loading profit data');
        setRevenueData([]);
        setExpenseData([]);
        setProfitData([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setRevenueData([]);
      setExpenseData([]);
      setProfitData([]);
    }
  };

  const exportToExcel = () => {
    if (revenueData.length === 0 && expenseData.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Revenue sheet
    const revenueSheetData = [
      ['BÁO CÁO DOANH THU THÁNG ' + selectedPeriod],
      [],
      ['STT', 'Khách hàng', 'Ngày', 'Số sản phẩm', 'Tổng tiền', 'Trạng thái'],
      ...revenueData.map((inv, index) => [
        index + 1,
        inv.customer_name,
        new Date(inv.invoice_date).toLocaleDateString('vi-VN'),
        inv.items?.length || 0,
        inv.total_amount || 0,
        'Hoàn thành'
      ]),
      [],
      ['TỔNG DOANH THU', '', '', '', summaryStats.totalRevenue]
    ];

    // Expense sheet
    const expenseSheetData = [
      ['BÁO CÁO CHI PHÍ THÁNG ' + selectedPeriod],
      [],
      ['STT', 'Loại chi phí', 'Mô tả', 'Số tiền', 'Ngày', 'Trạng thái'],
      ...expenseData.map((exp, index) => [
        index + 1,
        exp.loaichiphi?.tenchiphi || 'N/A',
        exp.mo_ta || '',
        exp.giathanh || 0,
        exp.created_at ? new Date(exp.created_at).toLocaleDateString('vi-VN') : '',
        'Hoàn thành'
      ]),
      [],
      ['TỔNG CHI PHÍ', '', '', '', summaryStats.totalExpenses]
    ];

    // Profit summary sheet
    const profitSheetData = [
      ['BÁO CÁO LỢI NHUẬN THÁNG ' + selectedPeriod],
      [],
      ['Chỉ số', 'Giá trị', 'Đơn vị'],
      ['Tổng doanh thu', summaryStats.totalRevenue, 'VND'],
      ['Tổng chi phí', summaryStats.totalExpenses, 'VND'],
      ['Lợi nhuận', summaryStats.totalProfit, 'VND'],
      ['Tỷ suất lợi nhuận', summaryStats.profitMargin.toFixed(2), '%'],
      [],
      ['Trạng thái', summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ', '']
    ];

    const revenueWs = XLSX.utils.aoa_to_sheet(revenueSheetData);
    const expenseWs = XLSX.utils.aoa_to_sheet(expenseSheetData);
    const profitWs = XLSX.utils.aoa_to_sheet(profitSheetData);

    XLSX.utils.book_append_sheet(wb, revenueWs, 'Doanh_Thu');
    XLSX.utils.book_append_sheet(wb, expenseWs, 'Chi_Phi');
    XLSX.utils.book_append_sheet(wb, profitWs, 'Loi_Nhuan');

    XLSX.writeFile(wb, `BaoCao_LoiNhuan_Thang_${selectedPeriod}.xlsx`);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo cáo lợi nhuận tháng ${selectedPeriod}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; }
            .revenue { color: #10B981; }
            .expense { color: #EF4444; }
            .profit { color: #3B82F6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BÁO CÁO LỢI NHUẬN</h1>
            <h2>Tháng ${selectedPeriod}</h2>
            <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-value revenue">${summaryStats.totalRevenue.toLocaleString('vi-VN')} VND</div>
              <div>Tổng doanh thu</div>
            </div>
            <div class="stat-box">
              <div class="stat-value expense">${summaryStats.totalExpenses.toLocaleString('vi-VN')} VND</div>
              <div>Tổng chi phí</div>
            </div>
            <div class="stat-box">
              <div class="stat-value profit ${summaryStats.totalProfit >= 0 ? 'revenue' : 'expense'}">${summaryStats.totalProfit.toLocaleString('vi-VN')} VND</div>
              <div>Lợi nhuận</div>
            </div>
          </div>

          <div class="summary">
            <h3>Tóm tắt</h3>
            <p><strong>Tỷ suất lợi nhuận:</strong> ${summaryStats.profitMargin.toFixed(2)}%</p>
            <p><strong>Trạng thái:</strong> ${summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ'}</p>
          </div>

          <h3>Chi tiết doanh thu</h3>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Khách hàng</th>
                <th>Ngày</th>
                <th>Số sản phẩm</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              ${revenueData.map((inv, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${inv.customer_name}</td>
                  <td>${new Date(inv.invoice_date).toLocaleDateString('vi-VN')}</td>
                  <td>${inv.items?.length || 0}</td>
                  <td>${(inv.total_amount || 0).toLocaleString('vi-VN')} VND</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Chi tiết chi phí</h3>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Loại chi phí</th>
                <th>Mô tả</th>
                <th>Số tiền</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              ${expenseData.map((exp, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${exp.loaichiphi?.tenchiphi || 'N/A'}</td>
                  <td>${exp.mo_ta || ''}</td>
                  <td>${(exp.giathanh || 0).toLocaleString('vi-VN')} VND</td>
                  <td>${exp.created_at ? new Date(exp.created_at).toLocaleDateString('vi-VN') : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Báo cáo được tạo tự động bởi hệ thống quản lý</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Target className="w-8 h-8 mr-3 text-blue-600" />
                Báo cáo lợi nhuận
              </h1>
              <p className="text-gray-600 mt-1">Phân tích doanh thu, chi phí và lợi nhuận</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Trực tuyến</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn tháng</label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tải lại</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Xuất PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.totalRevenue.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.totalExpenses.toLocaleString('vi-VN')} VND</p>
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
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
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

        {/* Profit Status */}
        <div className={`rounded-xl p-6 mb-8 ${summaryStats.totalProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${summaryStats.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {summaryStats.totalProfit >= 0 ? (
                <Award className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <h3 className={`text-lg font-semibold ${summaryStats.totalProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ'}
              </h3>
              <p className={`text-sm ${summaryStats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {summaryStats.totalProfit >= 0
                  ? `Doanh nghiệp đang có lãi ${Math.abs(summaryStats.totalProfit).toLocaleString('vi-VN')} VND trong tháng ${selectedPeriod}`
                  : `Doanh nghiệp đang lỗ ${Math.abs(summaryStats.totalProfit).toLocaleString('vi-VN')} VND trong tháng ${selectedPeriod}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
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
                        {(inv.total_amount || 0).toLocaleString('vi-VN')} VND
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

        {/* Summary Footer */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt tháng {selectedPeriod}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{revenueData.length}</p>
              <p className="text-sm text-gray-600">Tổng hóa đơn</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{expenseData.length}</p>
              <p className="text-sm text-gray-600">Tổng khoản chi phí</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${summaryStats.totalProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
              <p className={`text-2xl font-bold ${summaryStats.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {summaryStats.profitMargin.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600">Tỷ suất lợi nhuận</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
