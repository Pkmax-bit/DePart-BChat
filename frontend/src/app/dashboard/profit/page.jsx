'use client';'use client';



import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import * as XLSX from 'xlsx';import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

import ProfitHeader from './components/ProfitHeader';import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar, BarChart3, PieChart as PieChartIcon, FileSpreadsheet, Printer, Eye, RefreshCw, Target, Award, AlertTriangle } from 'lucide-react';

import ProfitControls from './components/ProfitControls';import * as XLSX from 'xlsx';

import ProfitStatsCards from './components/ProfitStatsCards';

import ProfitCharts from './components/ProfitCharts';const supabase = createClientComponentClient();

import ProfitMetrics from './components/ProfitMetrics';

import ProfitStatus from './components/ProfitStatus';export default function ProfitPage() {

import ProfitTables from './components/ProfitTables';  const [user, setUser] = useState(null);

import ProfitReportsTable from './components/ProfitReportsTable';  const [loading, setLoading] = useState(true);

import ProfitSummary from './components/ProfitSummary';  const [syncing, setSyncing] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));

const supabase = createClientComponentClient();  const [allProfitData, setAllProfitData] = useState([]);

  const [revenueData, setRevenueData] = useState([]);

export default function ProfitPage() {  const [expenseData, setExpenseData] = useState([]);

  const [user, setUser] = useState(null);  const [profitData, setProfitData] = useState([]);

  const [loading, setLoading] = useState(true);  const [summaryStats, setSummaryStats] = useState({

  const [syncing, setSyncing] = useState(false);    totalRevenue: 0,

  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));    totalExpenses: 0,

  const [allProfitData, setAllProfitData] = useState([]);    totalProfit: 0,

  const [revenueData, setRevenueData] = useState([]);    profitMargin: 0,

  const [expenseData, setExpenseData] = useState([]);    invoiceCount: 0,

  const [profitData, setProfitData] = useState([]);    expenseCount: 0,

  const [summaryStats, setSummaryStats] = useState({    productCount: 0,

    totalRevenue: 0,    revenueGrowth: 0,

    totalExpenses: 0,    expenseGrowth: 0

    totalProfit: 0,  });

    profitMargin: 0,

    invoiceCount: 0,  useEffect(() => {

    expenseCount: 0,    const getUser = async () => {

    productCount: 0,      try {

    revenueGrowth: 0,        const { data: { user } } = await supabase.auth.getUser();

    expenseGrowth: 0        setUser(user);

  });        setLoading(false);



  useEffect(() => {        // Always try to load data, regardless of authentication status

    const getUser = async () => {        await loadData();

      try {      } catch (error) {

        const { data: { user } } = await supabase.auth.getUser();        console.error('Auth error:', error);

        setUser(user);        setUser(null);

        setLoading(false);        setLoading(false);

        // Still try to load data even if auth fails

        // Always try to load data, regardless of authentication status        await loadData();

        await loadData();      }

      } catch (error) {    };

        console.error('Auth error:', error);    getUser();

        setUser(null);  }, [selectedPeriod]);

        setLoading(false);

        // Still try to load data even if auth fails  const loadData = async () => {

        await loadData();    try {

      }      // Load all profit reports from the new endpoint

    };      const profitReportsResponse = await fetch('http://localhost:8001/api/v1/accounting/profits/', {

    getUser();        method: 'GET',

  }, [selectedPeriod]);        headers: {

          'Content-Type': 'application/json'

  const loadData = async () => {        }

    try {      });

      // Load all profit reports from the new endpoint

      const profitReportsResponse = await fetch('http://localhost:8001/api/v1/accounting/profits/', {      if (profitReportsResponse.ok) {

        method: 'GET',        const profitReports = await profitReportsResponse.json();

        headers: {        setAllProfitData(profitReports);

          'Content-Type': 'application/json'

        }        // Find data for selected period

      });        const selectedMonthData = profitReports.find(report => report.report_month === selectedPeriod);



      if (profitReportsResponse.ok) {        if (selectedMonthData) {

        const profitReports = await profitReportsResponse.json();          setProfitData([{

        setAllProfitData(profitReports);            month: selectedPeriod,

            revenue: selectedMonthData.total_revenue,

        // Find data for selected period            expenses: selectedMonthData.total_expenses,

        const selectedMonthData = profitReports.find(report => report.report_month === selectedPeriod);            profit: selectedMonthData.total_profit,

            profitMargin: selectedMonthData.profit_margin

        if (selectedMonthData) {          }]);

          setProfitData([{          setSummaryStats({

            month: selectedPeriod,            totalRevenue: selectedMonthData.total_revenue,

            revenue: selectedMonthData.total_revenue,            totalExpenses: selectedMonthData.total_expenses,

            expenses: selectedMonthData.total_expenses,            totalProfit: selectedMonthData.total_profit,

            profit: selectedMonthData.total_profit,            profitMargin: selectedMonthData.profit_margin,

            profitMargin: selectedMonthData.profit_margin            invoiceCount: selectedMonthData.invoice_count,

          }]);            expenseCount: selectedMonthData.expense_count,

          setSummaryStats({            productCount: selectedMonthData.product_count,

            totalRevenue: selectedMonthData.total_revenue,            revenueGrowth: 0,

            totalExpenses: selectedMonthData.total_expenses,            expenseGrowth: 0

            totalProfit: selectedMonthData.total_profit,          });

            profitMargin: selectedMonthData.profit_margin,        } else {

            invoiceCount: selectedMonthData.invoice_count,          // If no data for selected month, load from detailed endpoint

            expenseCount: selectedMonthData.expense_count,          await loadDetailedData();

            productCount: selectedMonthData.product_count,        }

            revenueGrowth: 0,      } else {

            expenseGrowth: 0        // Fallback to detailed endpoint if profit reports endpoint fails

          });        await loadDetailedData();

        } else {      }

          // If no data for selected month, load from detailed endpoint    } catch (error) {

          await loadDetailedData();      console.error('Error loading data:', error);

        }      setRevenueData([]);

      } else {      setExpenseData([]);

        // Fallback to detailed endpoint if profit reports endpoint fails      setProfitData([]);

        await loadDetailedData();      setAllProfitData([]);

      }    }

    } catch (error) {  };

      console.error('Error loading data:', error);

      setRevenueData([]);  const loadDetailedData = async () => {

      setExpenseData([]);    try {

      setProfitData([]);      // Load profit report data from single endpoint

      setAllProfitData([]);      const profitResponse = await fetch(`http://localhost:8001/api/v1/accounting/profit/?month=${selectedPeriod}`, {

    }        method: 'GET',

  };        headers: {

          'Content-Type': 'application/json'

  const loadDetailedData = async () => {        }

    try {      });

      // Load profit report data from single endpoint

      const profitResponse = await fetch(`http://localhost:8001/api/v1/accounting/profit/?month=${selectedPeriod}`, {      if (profitResponse.ok) {

        method: 'GET',        const profitData = await profitResponse.json();

        headers: {

          'Content-Type': 'application/json'        setRevenueData(profitData.details.revenue || []);

        }        setExpenseData(profitData.details.expenses || []);

      });        setProfitData([{

          month: selectedPeriod,

      if (profitResponse.ok) {          revenue: profitData.summary.total_revenue,

        const profitData = await profitResponse.json();          expenses: profitData.summary.total_expenses,

          profit: profitData.summary.total_profit,

        setRevenueData(profitData.details.revenue || []);          profitMargin: profitData.summary.profit_margin

        setExpenseData(profitData.details.expenses || []);        }]);

        setProfitData([{        setSummaryStats({

          month: selectedPeriod,          totalRevenue: profitData.summary.total_revenue,

          revenue: profitData.summary.total_revenue,          totalExpenses: profitData.summary.total_expenses,

          expenses: profitData.summary.total_expenses,          totalProfit: profitData.summary.total_profit,

          profit: profitData.summary.total_profit,          profitMargin: profitData.summary.profit_margin,

          profitMargin: profitData.summary.profit_margin          invoiceCount: profitData.summary.revenue_count || 0,

        }]);          expenseCount: profitData.summary.expense_count || 0,

        setSummaryStats({          productCount: 0, // This might not be available in detailed data

          totalRevenue: profitData.summary.total_revenue,          revenueGrowth: 0,

          totalExpenses: profitData.summary.total_expenses,          expenseGrowth: 0

          totalProfit: profitData.summary.total_profit,        });

          profitMargin: profitData.summary.profit_margin,      } else {

          invoiceCount: profitData.summary.revenue_count || 0,        console.error('Error loading profit data');

          expenseCount: profitData.summary.expense_count || 0,        setRevenueData([]);

          productCount: 0, // This might not be available in detailed data        setExpenseData([]);

          revenueGrowth: 0,        setProfitData([]);

          expenseGrowth: 0      }

        });    } catch (error) {

      } else {      console.error('Error loading detailed data:', error);

        console.error('Error loading profit data');      setRevenueData([]);

        setRevenueData([]);      setExpenseData([]);

        setExpenseData([]);      setProfitData([]);

        setProfitData([]);    }

      }  };

    } catch (error) {

      console.error('Error loading detailed data:', error);  const syncAllData = async () => {

      setRevenueData([]);    try {

      setExpenseData([]);      setSyncing(true);

      setProfitData([]);

    }      // Call sync all endpoint

  };      const syncResponse = await fetch('http://localhost:8001/api/v1/accounting/profits/sync_all/', {

        method: 'POST',

  const syncAllData = async () => {        headers: {

    try {          'Content-Type': 'application/json'

      setSyncing(true);        }

      });

      // Call sync all endpoint

      const syncResponse = await fetch('http://localhost:8001/api/v1/accounting/profits/sync_all/', {      if (syncResponse.ok) {

        method: 'POST',        const syncResult = await syncResponse.json();

        headers: {        console.log('Sync completed:', syncResult);

          'Content-Type': 'application/json'        alert(`Đã đồng bộ ${syncResult.months_processed} tháng thành công!`);

        }        // Reload data after sync

      });        await loadData();

      } else {

      if (syncResponse.ok) {        console.error('Error syncing data');

        const syncResult = await syncResponse.json();        alert('Lỗi khi đồng bộ dữ liệu');

        console.log('Sync completed:', syncResult);      }

        alert(`Đã đồng bộ ${syncResult.months_processed} tháng thành công!`);    } catch (error) {

        // Reload data after sync      console.error('Error syncing data:', error);

        await loadData();      alert('Lỗi khi đồng bộ dữ liệu');

      } else {    } finally {

        console.error('Error syncing data');      setSyncing(false);

        alert('Lỗi khi đồng bộ dữ liệu');    }

      }  };

    } catch (error) {

      console.error('Error syncing data:', error);  const exportToExcel = async () => {

      alert('Lỗi khi đồng bộ dữ liệu');    try {

    } finally {      console.log('Starting Excel export for month:', selectedPeriod);

      setSyncing(false);

    }      // Show loading state

  };      const exportButton = document.querySelector('button[title="Xuất Excel"]');

      if (exportButton) {

  const exportToExcel = async () => {        exportButton.disabled = true;

    try {        exportButton.innerHTML = '<div class="flex items-center space-x-2"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Đang xuất...</span></div>';

      console.log('Starting Excel export for month:', selectedPeriod);      }



      // Show loading state      // Call backend Excel export endpoint

      const exportButton = document.querySelector('button[title="Xuất Excel"]');      const response = await fetch(`http://localhost:8001/api/v1/accounting/export_profit_excel/?month=${selectedPeriod}`, {

      if (exportButton) {        method: 'GET',

        exportButton.disabled = true;        headers: {

        exportButton.innerHTML = '<div class="flex items-center space-x-2"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Đang xuất...</span></div>';          'Content-Type': 'application/json'

      }        }

      });

      // Call backend Excel export endpoint

      const response = await fetch(`http://localhost:8001/api/v1/accounting/export_profit_excel/?month=${selectedPeriod}`, {      if (response.ok) {

        method: 'GET',        // Get filename from response headers

        headers: {        const contentDisposition = response.headers.get('content-disposition');

          'Content-Type': 'application/json'        let filename = `bao_cao_loi_nhuan_${selectedPeriod || 'all'}.xlsx`;

        }

      });        if (contentDisposition) {

          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);

      if (response.ok) {          if (filenameMatch && filenameMatch[1]) {

        // Get filename from response headers            filename = filenameMatch[1].replace(/['"]/g, '');

        const contentDisposition = response.headers.get('content-disposition');          }

        let filename = `bao_cao_loi_nhuan_${selectedPeriod || 'all'}.xlsx`;        }



        if (contentDisposition) {        // Create blob and download

          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);        const blob = await response.blob();

          if (filenameMatch && filenameMatch[1]) {        const url = window.URL.createObjectURL(blob);

            filename = filenameMatch[1].replace(/['"]/g, '');        const a = document.createElement('a');

          }        a.href = url;

        }        a.download = filename;

        document.body.appendChild(a);

        // Create blob and download        a.click();

        const blob = await response.blob();        window.URL.revokeObjectURL(url);

        const url = window.URL.createObjectURL(blob);        document.body.removeChild(a);

        const a = document.createElement('a');

        a.href = url;        alert(`Xuất Excel thành công! File: ${filename}`);

        a.download = filename;      } else {

        document.body.appendChild(a);        const errorData = await response.json();

        a.click();        console.error('Export error:', errorData);

        window.URL.revokeObjectURL(url);        alert(`Lỗi xuất Excel: ${errorData.detail || 'Có lỗi xảy ra'}`);

        document.body.removeChild(a);      }

    } catch (error) {

        alert(`Xuất Excel thành công! File: ${filename}`);      console.error('Network error during export:', error);

      } else {      alert('Lỗi kết nối khi xuất Excel. Vui lòng thử lại.');

        const errorData = await response.json();    } finally {

        console.error('Export error:', errorData);      // Reset button state

        alert(`Lỗi xuất Excel: ${errorData.detail || 'Có lỗi xảy ra'}`);      const exportButton = document.querySelector('button[title="Xuất Excel"]');

      }      if (exportButton) {

    } catch (error) {        exportButton.disabled = false;

      console.error('Network error during export:', error);        exportButton.innerHTML = '<div class="flex items-center space-x-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Xuất Excel</span></div>';

      alert('Lỗi kết nối khi xuất Excel. Vui lòng thử lại.');      }

    } finally {    }

      // Reset button state  };

      const exportButton = document.querySelector('button[title="Xuất Excel"]');

      if (exportButton) {  const exportToPDF = () => {

        exportButton.disabled = false;    const printWindow = window.open('', '_blank');

        exportButton.innerHTML = '<div class="flex items-center space-x-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Xuất Excel</span></div>';    const htmlContent = `

      }      <!DOCTYPE html>

    }      <html>

  };        <head>

          <title>Báo cáo lợi nhuận tháng ${selectedPeriod}</title>

  const exportToPDF = () => {          <style>

    const printWindow = window.open('', '_blank');            body { font-family: Arial, sans-serif; margin: 20px; }

    const htmlContent = `            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }

      <!DOCTYPE html>            .stats { display: flex; justify-content: space-around; margin: 30px 0; }

      <html>            .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }

        <head>            .stat-value { font-size: 24px; font-weight: bold; }

          <title>Báo cáo lợi nhuận tháng ${selectedPeriod}</title>            .revenue { color: #10B981; }

          <style>            .expense { color: #EF4444; }

            body { font-family: Arial, sans-serif; margin: 20px; }            .profit { color: #3B82F6; }

            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }            table { width: 100%; border-collapse: collapse; margin: 20px 0; }

            .stats { display: flex; justify-content: space-around; margin: 30px 0; }            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }

            .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }            th { background-color: #f5f5f5; }

            .stat-value { font-size: 24px; font-weight: bold; }            .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }

            .revenue { color: #10B981; }            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }

            .expense { color: #EF4444; }          </style>

            .profit { color: #3B82F6; }        </head>

            table { width: 100%; border-collapse: collapse; margin: 20px 0; }        <body>

            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }          <div class="header">

            th { background-color: #f5f5f5; }            <h1>BÁO CÁO LỢI NHUẬN</h1>

            .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }            <h2>Tháng ${selectedPeriod}</h2>

            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }            <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>

          </style>          </div>

        </head>

        <body>          <div class="stats">

          <div class="header">            <div class="stat-box">

            <h1>BÁO CÁO LỢI NHUẬN</h1>              <div class="stat-value revenue">${summaryStats.totalRevenue.toLocaleString('vi-VN')} VND</div>

            <h2>Tháng ${selectedPeriod}</h2>              <div>Tổng doanh thu</div>

            <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>            </div>

          </div>            <div class="stat-box">

              <div class="stat-value expense">${summaryStats.totalExpenses.toLocaleString('vi-VN')} VND</div>

          <div class="stats">              <div>Tổng chi phí</div>

            <div class="stat-box">            </div>

              <div class="stat-value revenue">${summaryStats.totalRevenue.toLocaleString('vi-VN')} VND</div>            <div class="stat-box">

              <div>Tổng doanh thu</div>              <div class="stat-value profit ${summaryStats.totalProfit >= 0 ? 'revenue' : 'expense'}">${summaryStats.totalProfit.toLocaleString('vi-VN')} VND</div>

            </div>              <div>Lợi nhuận</div>

            <div class="stat-box">            </div>

              <div class="stat-value expense">${summaryStats.totalExpenses.toLocaleString('vi-VN')} VND</div>          </div>

              <div>Tổng chi phí</div>

            </div>          <div class="summary">

            <div class="stat-box">            <h3>Tóm tắt</h3>

              <div class="stat-value profit ${summaryStats.totalProfit >= 0 ? 'revenue' : 'expense'}">${summaryStats.totalProfit.toLocaleString('vi-VN')} VND</div>            <p><strong>Tỷ suất lợi nhuận:</strong> ${summaryStats.profitMargin.toFixed(2)}%</p>

              <div>Lợi nhuận</div>            <p><strong>Số hóa đơn:</strong> ${summaryStats.invoiceCount}</p>

            </div>            <p><strong>Số chi phí:</strong> ${summaryStats.expenseCount}</p>

          </div>            <p><strong>Số sản phẩm:</strong> ${summaryStats.productCount}</p>

            <p><strong>Lợi nhuận/Hóa đơn:</strong> ${summaryStats.invoiceCount > 0 ? (summaryStats.totalProfit / summaryStats.invoiceCount).toLocaleString('vi-VN') : 0} VND</p>

          <div class="summary">            <p><strong>Trạng thái:</strong> ${summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ'}</p>

            <h3>Tóm tắt</h3>          </div>

            <p><strong>Tỷ suất lợi nhuận:</strong> ${summaryStats.profitMargin.toFixed(2)}%</p>

            <p><strong>Số hóa đơn:</strong> ${summaryStats.invoiceCount}</p>          <h3>Báo cáo lợi nhuận tất cả các tháng</h3>

            <p><strong>Số chi phí:</strong> ${summaryStats.expenseCount}</p>          <table>

            <p><strong>Số sản phẩm:</strong> ${summaryStats.productCount}</p>            <thead>

            <p><strong>Lợi nhuận/Hóa đơn:</strong> ${summaryStats.invoiceCount > 0 ? (summaryStats.totalProfit / summaryStats.invoiceCount).toLocaleString('vi-VN') : 0} VND</p>              <tr>

            <p><strong>Trạng thái:</strong> ${summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ'}</p>                <th>Tháng</th>

          </div>                <th>Doanh thu</th>

                <th>Chi phí</th>

          <h3>Báo cáo lợi nhuận tất cả các tháng</h3>                <th>Lợi nhuận</th>

          <table>                <th>Tỷ suất (%)</th>

            <thead>                <th>Hóa đơn</th>

              <tr>                <th>Chi phí</th>

                <th>Tháng</th>                <th>Sản phẩm</th>

                <th>Doanh thu</th>                <th>Trạng thái</th>

                <th>Chi phí</th>              </tr>

                <th>Lợi nhuận</th>            </thead>

                <th>Tỷ suất (%)</th>            <tbody>

                <th>Hóa đơn</th>              ${allProfitData.slice().reverse().map(report => `

                <th>Chi phí</th>                <tr>

                <th>Sản phẩm</th>                  <td>${report.report_month}</td>

                <th>Trạng thái</th>                  <td>${report.total_revenue.toLocaleString('vi-VN')} VND</td>

              </tr>                  <td>${report.total_expenses.toLocaleString('vi-VN')} VND</td>

            </thead>                  <td>${report.total_profit.toLocaleString('vi-VN')} VND</td>

            <tbody>                  <td>${report.profit_margin.toFixed(2)}%</td>

              ${allProfitData.slice().reverse().map(report => \`                  <td>${report.invoice_count}</td>

                <tr>                  <td>${report.expense_count}</td>

                  <td>${report.report_month}</td>                  <td>${report.product_count}</td>

                  <td>${report.total_revenue.toLocaleString('vi-VN')} VND</td>                  <td>${report.total_profit >= 0 ? 'Lợi nhuận' : 'Lỗ'}</td>

                  <td>${report.total_expenses.toLocaleString('vi-VN')} VND</td>                </tr>

                  <td>${report.total_profit.toLocaleString('vi-VN')} VND</td>              `).join('')}

                  <td>${report.profit_margin.toFixed(2)}%</td>            </tbody>

                  <td>${report.invoice_count}</td>          </table>

                  <td>${report.expense_count}</td>

                  <td>${report.product_count}</td>          <h3>Chi tiết chi phí</h3>

                  <td>${report.total_profit >= 0 ? 'Lợi nhuận' : 'Lỗ'}</td>          <table>

                </tr>            <thead>

              \`).join('')}              <tr>

            </tbody>                <th>STT</th>

          </table>                <th>Loại chi phí</th>

                <th>Mô tả</th>

          <h3>Chi tiết chi phí</h3>                <th>Số tiền</th>

          <table>                <th>Ngày</th>

            <thead>              </tr>

              <tr>            </thead>

                <th>STT</th>            <tbody>

                <th>Loại chi phí</th>              ${expenseData.map((exp, index) => `

                <th>Mô tả</th>                <tr>

                <th>Số tiền</th>                  <td>${index + 1}</td>

                <th>Ngày</th>                  <td>${exp.loaichiphi?.tenchiphi || 'N/A'}</td>

              </tr>                  <td>${exp.mo_ta || ''}</td>

            </thead>                  <td>${(exp.giathanh || 0).toLocaleString('vi-VN')} VND</td>

            <tbody>                  <td>${exp.created_at ? new Date(exp.created_at).toLocaleDateString('vi-VN') : ''}</td>

              ${expenseData.map((exp, index) => \`                </tr>

                <tr>              `).join('')}

                  <td>${index + 1}</td>            </tbody>

                  <td>${exp.loaichiphi?.tenchiphi || 'N/A'}</td>          </table>

                  <td>${exp.mo_ta || ''}</td>

                  <td>${(exp.giathanh || 0).toLocaleString('vi-VN')} VND</td>          <div class="footer">

                  <td>${exp.created_at ? new Date(exp.created_at).toLocaleDateString('vi-VN') : ''}</td>            <p>Báo cáo được tạo tự động bởi hệ thống quản lý</p>

                </tr>          </div>

              \`).join('')}        </body>

            </tbody>      </html>

          </table>    `;



          <div class="footer">    printWindow.document.write(htmlContent);

            <p>Báo cáo được tạo tự động bởi hệ thống quản lý</p>    printWindow.document.close();

          </div>    printWindow.print();

        </body>  };

      </html>

    `;  if (loading) {

    return (

    printWindow.document.write(htmlContent);      <div className="flex items-center justify-center min-h-screen bg-gray-50">

    printWindow.document.close();        <div className="flex items-center space-x-3">

    printWindow.print();          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

  };          <p className="text-lg text-gray-700">Đang tải dữ liệu...</p>

        </div>

  if (loading) {      </div>

    return (    );

      <div className="flex items-center justify-center min-h-screen bg-gray-50">  }

        <div className="flex items-center space-x-3">

          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>  return (

          <p className="text-lg text-gray-700">Đang tải dữ liệu...</p>    <div className="min-h-screen bg-gray-50">

        </div>      {/* Header */}

      </div>      <div className="bg-white shadow-sm border-b">

    );        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

  }          <div className="flex justify-between items-center py-6">

            <div>

  return (              <h1 className="text-3xl font-bold text-gray-900 flex items-center">

    <div className="min-h-screen bg-gray-50">                <Target className="w-8 h-8 mr-3 text-blue-600" />

      <ProfitHeader user={user} />                Báo cáo lợi nhuận

      <ProfitControls              </h1>

        selectedPeriod={selectedPeriod}              <p className="text-gray-600 mt-1">Phân tích doanh thu, chi phí và lợi nhuận</p>

        setSelectedPeriod={setSelectedPeriod}            </div>

        loadData={loadData}            <div className="flex items-center space-x-4">

        syncAllData={syncAllData}              <div className="text-right">

        syncing={syncing}                <p className="text-sm text-gray-600">Xin chào</p>

        exportToExcel={exportToExcel}                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>

        exportToPDF={exportToPDF}              </div>

      />              <div className="flex items-center space-x-2">

                <div className="w-3 h-3 bg-green-500 rounded-full"></div>

      {/* Content */}                <span className="text-sm text-gray-600">Trực tuyến</span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">              </div>

        <ProfitStatsCards summaryStats={summaryStats} selectedPeriod={selectedPeriod} />            </div>

        <ProfitCharts profitData={profitData} summaryStats={summaryStats} selectedPeriod={selectedPeriod} />          </div>

        <ProfitMetrics summaryStats={summaryStats} selectedPeriod={selectedPeriod} allProfitData={allProfitData} />        </div>

        <ProfitStatus summaryStats={summaryStats} selectedPeriod={selectedPeriod} />      </div>

        <ProfitTables revenueData={revenueData} expenseData={expenseData} />

        <ProfitReportsTable allProfitData={allProfitData} selectedPeriod={selectedPeriod} />      {/* Controls */}

        <ProfitSummary summaryStats={summaryStats} selectedPeriod={selectedPeriod} />      <div className="bg-white shadow-sm border-b">

      </div>        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    </div>          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">

  );            <div className="flex items-center space-x-4">

}              <div>
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
