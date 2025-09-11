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
  const [syncing, setSyncing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [allProfitData, setAllProfitData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    profitMargin: 0,
    invoiceCount: 0,
    expenseCount: 0,
    productCount: 0,
    revenueGrowth: 0,
    expenseGrowth: 0
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);

        // Always try to load data, regardless of authentication status
        await loadData();
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setLoading(false);
        // Still try to load data even if auth fails
        await loadData();
      }
    };
    getUser();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      // Load all profit reports from the new endpoint
      const profitReportsResponse = await fetch('http://localhost:8001/api/v1/accounting/profits/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (profitReportsResponse.ok) {
        const profitReports = await profitReportsResponse.json();
        setAllProfitData(profitReports);

        // Find data for selected period
        const selectedMonthData = profitReports.find(report => report.report_month === selectedPeriod);

        if (selectedMonthData) {
          setProfitData([{
            month: selectedPeriod,
            revenue: selectedMonthData.total_revenue,
            expenses: selectedMonthData.total_expenses,
            profit: selectedMonthData.total_profit,
            profitMargin: selectedMonthData.profit_margin
          }]);
          setSummaryStats({
            totalRevenue: selectedMonthData.total_revenue,
            totalExpenses: selectedMonthData.total_expenses,
            totalProfit: selectedMonthData.total_profit,
            profitMargin: selectedMonthData.profit_margin,
            invoiceCount: selectedMonthData.invoice_count,
            expenseCount: selectedMonthData.expense_count,
            productCount: selectedMonthData.product_count,
            revenueGrowth: 0,
            expenseGrowth: 0
          });
        } else {
          // If no data for selected month, load from detailed endpoint
          await loadDetailedData();
        }
      } else {
        // Fallback to detailed endpoint if profit reports endpoint fails
        await loadDetailedData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setRevenueData([]);
      setExpenseData([]);
      setProfitData([]);
      setAllProfitData([]);
    }
  };

  const loadDetailedData = async () => {
    try {
      // Load profit report data from single endpoint
      const profitResponse = await fetch(`http://localhost:8001/api/v1/accounting/profit/?month=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
          invoiceCount: profitData.summary.revenue_count || 0,
          expenseCount: profitData.summary.expense_count || 0,
          productCount: 0, // This might not be available in detailed data
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
      console.error('Error loading detailed data:', error);
      setRevenueData([]);
      setExpenseData([]);
      setProfitData([]);
    }
  };

  const syncAllData = async () => {
    try {
      setSyncing(true);

      // Call sync all endpoint
      const syncResponse = await fetch('http://localhost:8001/api/v1/accounting/profits/sync_all/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log('Sync completed:', syncResult);
        alert(`Đã đồng bộ ${syncResult.months_processed} tháng thành công!`);
        // Reload data after sync
        await loadData();
      } else {
        console.error('Error syncing data');
        alert('Lỗi khi đồng bộ dữ liệu');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('Lỗi khi đồng bộ dữ liệu');
    } finally {
      setSyncing(false);
    }
  };

  const exportToExcel = () => {
    if (allProfitData.length === 0 && revenueData.length === 0 && expenseData.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Profit summary sheet for all months
    if (allProfitData.length > 0) {
      const profitSummaryData = [
        ['BÁO CÁO LỢI NHUẬN TẤT CẢ CÁC THÁNG'],
        [],
        ['Tháng', 'Doanh thu', 'Chi phí', 'Lợi nhuận', 'Tỷ suất lợi nhuận (%)', 'Số hóa đơn', 'Số chi phí', 'Số sản phẩm', 'Trạng thái', 'Ngày cập nhật'],
        ...allProfitData.slice().reverse().map(report => [
          report.report_month,
          report.total_revenue,
          report.total_expenses,
          report.total_profit,
          report.profit_margin.toFixed(2),
          report.invoice_count,
          report.expense_count,
          report.product_count,
          report.total_profit >= 0 ? 'Lợi nhuận' : 'Lỗ',
          new Date(report.updated_at).toLocaleDateString('vi-VN')
        ]),
        [],
        ['TỔNG CỘNG', '', '', '', '', '', '', '', '']
      ];

      const profitWs = XLSX.utils.aoa_to_sheet(profitSummaryData);
      XLSX.utils.book_append_sheet(wb, profitWs, 'Tong_hop_Loi_nhuan');
    }

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

    // Profit summary sheet for selected month
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

    XLSX.writeFile(wb, `BaoCao_LoiNhuan_${selectedPeriod}.xlsx`);
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
            <p><strong>Số hóa đơn:</strong> ${summaryStats.invoiceCount}</p>
            <p><strong>Số chi phí:</strong> ${summaryStats.expenseCount}</p>
            <p><strong>Số sản phẩm:</strong> ${summaryStats.productCount}</p>
            <p><strong>Lợi nhuận/Hóa đơn:</strong> ${summaryStats.invoiceCount > 0 ? (summaryStats.totalProfit / summaryStats.invoiceCount).toLocaleString('vi-VN') : 0} VND</p>
            <p><strong>Trạng thái:</strong> ${summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ'}</p>
          </div>

          <h3>Báo cáo lợi nhuận tất cả các tháng</h3>
          <table>
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Doanh thu</th>
                <th>Chi phí</th>
                <th>Lợi nhuận</th>
                <th>Tỷ suất (%)</th>
                <th>Hóa đơn</th>
                <th>Chi phí</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${allProfitData.slice().reverse().map(report => `
                <tr>
                  <td>${report.report_month}</td>
                  <td>${report.total_revenue.toLocaleString('vi-VN')} VND</td>
                  <td>${report.total_expenses.toLocaleString('vi-VN')} VND</td>
                  <td>${report.total_profit.toLocaleString('vi-VN')} VND</td>
                  <td>${report.profit_margin.toFixed(2)}%</td>
                  <td>${report.invoice_count}</td>
                  <td>${report.expense_count}</td>
                  <td>${report.product_count}</td>
                  <td>${report.total_profit >= 0 ? 'Lợi nhuận' : 'Lỗ'}</td>
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
                onClick={syncAllData}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}</span>
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.totalExpenses.toLocaleString('vi-VN')} VND</p>
                <p className="text-xs text-gray-500 mt-1">{summaryStats.expenseCount || 0} khoản chi</p>
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

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Performance */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Hiệu suất tháng {selectedPeriod}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số hóa đơn:</span>
                <span className="text-sm font-semibold text-blue-600">{summaryStats.invoiceCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số chi phí:</span>
                <span className="text-sm font-semibold text-red-600">{summaryStats.expenseCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sản phẩm:</span>
                <span className="text-sm font-semibold text-purple-600">{summaryStats.productCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lợi nhuận/Hóa đơn:</span>
                <span className="text-sm font-semibold text-green-600">
                  {summaryStats.invoiceCount > 0 ? (summaryStats.totalProfit / summaryStats.invoiceCount).toLocaleString('vi-VN') : 0} VND
                </span>
              </div>
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Phân tích lợi nhuận
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tỷ suất lợi nhuận:</span>
                <span className={`text-sm font-semibold ${summaryStats.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.profitMargin.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Chi phí/Doanh thu:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {summaryStats.totalRevenue > 0 ? ((summaryStats.totalExpenses / summaryStats.totalRevenue) * 100).toFixed(2) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`text-sm font-semibold ${summaryStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.totalProfit >= 0 ? 'Có lãi' : 'Lỗ'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hiệu quả:</span>
                <span className={`text-sm font-semibold ${summaryStats.profitMargin >= 20 ? 'text-green-600' : summaryStats.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {summaryStats.profitMargin >= 20 ? 'Xuất sắc' : summaryStats.profitMargin >= 10 ? 'Tốt' : 'Cần cải thiện'}
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
                <span className="text-sm text-gray-600">Tháng báo cáo:</span>
                <span className="text-sm font-semibold text-gray-900">{allProfitData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tháng có lãi:</span>
                <span className="text-sm font-semibold text-green-600">
                  {allProfitData.filter(report => report.total_profit >= 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tháng lỗ:</span>
                <span className="text-sm font-semibold text-red-600">
                  {allProfitData.filter(report => report.total_profit < 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tỷ lệ thành công:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {allProfitData.length > 0 ? ((allProfitData.filter(report => report.total_profit >= 0).length / allProfitData.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
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

        {/* All Profit Reports Table */}
        {allProfitData.length > 0 && (
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lợi nhuận</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tỷ suất (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hóa đơn</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chi phí</th>
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
        )}

        {/* Summary Footer */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Tóm tắt tổng thể tháng {selectedPeriod}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summaryStats.invoiceCount}</p>
              <p className="text-sm text-gray-600">Tổng hóa đơn</p>
              <p className="text-xs text-gray-500 mt-1">
                Trung bình: {(summaryStats.invoiceCount > 0 ? summaryStats.totalRevenue / summaryStats.invoiceCount : 0).toLocaleString('vi-VN')} VND/đơn
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{summaryStats.expenseCount}</p>
              <p className="text-sm text-gray-600">Tổng khoản chi phí</p>
              <p className="text-xs text-gray-500 mt-1">
                Trung bình: {(summaryStats.expenseCount > 0 ? summaryStats.totalExpenses / summaryStats.expenseCount : 0).toLocaleString('vi-VN')} VND/khoản
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{summaryStats.productCount}</p>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-xs text-gray-500 mt-1">
                Trong kho
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${summaryStats.totalProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
              <p className={`text-2xl font-bold ${summaryStats.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {summaryStats.profitMargin.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600">Tỷ suất lợi nhuận</p>
              <p className={`text-xs mt-1 ${summaryStats.profitMargin >= 20 ? 'text-green-600' : summaryStats.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {summaryStats.profitMargin >= 20 ? 'Xuất sắc' : summaryStats.profitMargin >= 10 ? 'Tốt' : 'Cần cải thiện'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
