'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import ProfitHeader from './components/ProfitHeader';
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar, BarChart3, PieChart as PieChartIcon, FileSpreadsheet, Printer, Eye, RefreshCw, Target, Award, AlertTriangle } from 'lucide-react';
import ProfitControls from './components/ProfitControls';
import ProfitStatsCards from './components/ProfitStatsCards';
import ProfitCharts from './components/ProfitCharts';
import ProfitMetrics from './components/ProfitMetrics';
import ProfitStatus from './components/ProfitStatus';
import ProfitTables from './components/ProfitTables';
import ProfitReportsTable from './components/ProfitReportsTable';
import ProfitSummary from './components/ProfitSummary';

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

  const supabase = createClientComponentClient();

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

  const exportToExcel = async () => {
    try {
      console.log('Starting Excel export for month:', selectedPeriod);
      // Show loading state
      const exportButton = document.querySelector('button[title="Xuất Excel"]');
      if (exportButton) {
        exportButton.disabled = true;
        exportButton.innerHTML = '<div class="flex items-center space-x-2"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Đang xuất...</span></div>';
      }
      // Call backend Excel export endpoint
      const response = await fetch(`http://localhost:8001/api/v1/accounting/export_profit_excel/?month=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `bao_cao_loi_nhuan_${selectedPeriod || 'all'}.xlsx`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(`Xuất Excel thành công! File: ${filename}`);
      } else {
        const errorData = await response.json();
        console.error('Export error:', errorData);
        alert(`Lỗi xuất Excel: ${errorData.detail || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('Network error during export:', error);
      alert('Lỗi kết nối khi xuất Excel. Vui lòng thử lại.');
    } finally {
      // Reset button state
      const exportButton = document.querySelector('button[title="Xuất Excel"]');
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '<div class="flex items-center space-x-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Xuất Excel</span></div>';
      }
    }
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
      <ProfitHeader user={user} />
      <ProfitControls
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        loadData={loadData}
        syncAllData={syncAllData}
        syncing={syncing}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfitStatsCards summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
        <ProfitCharts profitData={profitData} summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
        <ProfitMetrics summaryStats={summaryStats} selectedPeriod={selectedPeriod} allProfitData={allProfitData} />
        <ProfitStatus summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
        <ProfitTables revenueData={revenueData} expenseData={expenseData} />
        <ProfitReportsTable allProfitData={allProfitData} selectedPeriod={selectedPeriod} />
        <ProfitSummary summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
      </div>
    </div>
  );
}
