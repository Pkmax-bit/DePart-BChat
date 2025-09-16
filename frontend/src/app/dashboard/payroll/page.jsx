'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import * as XLSX from 'xlsx';
import PayrollHeader from './components/PayrollHeader';
import PayrollControls from './components/PayrollControls';
import PayrollStatsCards from './components/PayrollStatsCards';
import PayrollCharts from './components/PayrollCharts';
import PayrollTables from './components/PayrollTables';
import PayrollSummary from './components/PayrollSummary';
import PayrollMetrics from './components/PayrollMetrics';
import PayrollStatus from './components/PayrollStatus';
import PayrollReportsTable from './components/PayrollReportsTable';

export default function PayrollPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [employeesData, setEmployeesData] = useState([]);
  const [timesheetsData, setTimesheetsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [allPayrollData, setAllPayrollData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalEmployees: 0,
    totalTimesheets: 0,
    totalProducts: 0,
    totalSalary: 0,
    totalOT: 0,
    productSalary: 0,
    totalPayrolls: 0
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
        await loadData();
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setLoading(false);
        await loadData();
      }
    };
    getUser();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      // Load employees
      const employeesResponse = await fetch('http://localhost:8001/api/v1/payroll/nhan-vien/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (employeesResponse.ok) {
        const employees = await employeesResponse.json();
        setEmployeesData(employees);
      }

      // Load timesheets for selected period
      const timesheetsResponse = await fetch(`http://localhost:8001/api/v1/payroll/bang-cham-cong/?ky_tinh_luong=${selectedPeriod}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (timesheetsResponse.ok) {
        const timesheets = await timesheetsResponse.json();
        setTimesheetsData(timesheets);
      }

      // Load products for selected period
      const productsResponse = await fetch(`http://localhost:8001/api/v1/payroll/luong-san-pham/?ky_tinh_luong=${selectedPeriod}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        setProductsData(products);
      }

      // Load payroll data for selected period
      const payrollResponse = await fetch(`http://localhost:8001/api/v1/payroll/phieu-luong/?ky_tinh_luong=${selectedPeriod}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (payrollResponse.ok) {
        const payroll = await payrollResponse.json();
        setPayrollData(payroll);
      }

      // Load all payroll data for reports table
      const allPayrollResponse = await fetch('http://localhost:8001/api/v1/payroll/phieu-luong/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (allPayrollResponse.ok) {
        const allPayroll = await allPayrollResponse.json();
        // Group by ky_tinh_luong and calculate summary for each month
        const groupedData = allPayroll.reduce((acc, item) => {
          const key = item.ky_tinh_luong;
          if (!acc[key]) {
            acc[key] = {
              ky_tinh_luong: key,
              total_salary: 0,
              product_salary: 0,
              total_ot_hours: 0,
              employee_count: 0,
              payroll_count: 0
            };
          }
          acc[key].total_salary += item.luong_thuc_nhan || 0;
          acc[key].payroll_count += 1;
          return acc;
        }, {});

        // Convert to array and sort by month
        const monthlyData = Object.values(groupedData).sort((a, b) => b.ky_tinh_luong.localeCompare(a.ky_tinh_luong));
        setAllPayrollData(monthlyData);
      }

      // Calculate summary stats
      calculateSummaryStats();

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateSummaryStats = () => {
    const totalEmployees = employeesData.length;
    const totalTimesheets = timesheetsData.length;
    const totalProducts = productsData.length;

    // Calculate total salary from payroll data
    const totalSalary = payrollData.reduce((sum, item) => sum + (item.luong_thuc_nhan || 0), 0);

    // Calculate total OT hours
    const totalOT = timesheetsData.reduce((sum, item) =>
      sum + (item.gio_ot_ngay_thuong || 0) + (item.gio_ot_cuoi_tuan || 0) + (item.gio_ot_le_tet || 0), 0);

    // Calculate product salary
    const productSalary = productsData.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);

    setSummaryStats({
      totalEmployees,
      totalTimesheets,
      totalProducts,
      totalSalary,
      totalOT,
      productSalary,
      totalPayrolls: payrollData.length
    });
  };

  useEffect(() => {
    calculateSummaryStats();
  }, [employeesData, timesheetsData, productsData, payrollData]);

  const syncAllData = async () => {
    try {
      setSyncing(true);
      // This would sync payroll data - placeholder for now
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
      alert('Đã đồng bộ dữ liệu lương thành công!');
      await loadData();
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('Lỗi khi đồng bộ dữ liệu');
    } finally {
      setSyncing(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const exportData = {
        employees: employeesData,
        timesheets: timesheetsData,
        products: productsData,
        payroll: payrollData
      };

      const wb = XLSX.utils.book_new();

      // Employees sheet
      const employeesWS = XLSX.utils.json_to_sheet(employeesData);
      XLSX.utils.book_append_sheet(wb, employeesWS, 'NhanVien');

      // Timesheets sheet
      const timesheetsWS = XLSX.utils.json_to_sheet(timesheetsData);
      XLSX.utils.book_append_sheet(wb, timesheetsWS, 'ChamCong');

      // Products sheet
      const productsWS = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, productsWS, 'LuongSanPham');

      // Payroll sheet
      const payrollWS = XLSX.utils.json_to_sheet(payrollData);
      XLSX.utils.book_append_sheet(wb, payrollWS, 'PhieuLuong');

      XLSX.writeFile(wb, `luong_${selectedPeriod}.xlsx`);
      alert('Xuất Excel thành công!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Lỗi xuất Excel');
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo cáo lương tháng ${selectedPeriod}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 30px 0; }
            .stat-box { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .summary { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BÁO CÁO LƯƠNG NHÂN VIÊN</h1>
            <h2>Tháng ${selectedPeriod}</h2>
            <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${summaryStats.totalEmployees}</div>
              <div>Tổng nhân viên</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${summaryStats.totalTimesheets}</div>
              <div>Bảng chấm công</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${summaryStats.totalSalary.toLocaleString('vi-VN')} VND</div>
              <div>Tổng lương</div>
            </div>
          </div>
          <div class="summary">
            <h3>Tóm tắt</h3>
            <p><strong>Lương trung bình:</strong> ${summaryStats.totalEmployees > 0 ? (summaryStats.totalSalary / summaryStats.totalEmployees).toLocaleString('vi-VN') : 0} VND</p>
            <p><strong>Tổng giờ OT:</strong> ${summaryStats.totalOT} giờ</p>
            <p><strong>Lương sản phẩm:</strong> ${summaryStats.productSalary.toLocaleString('vi-VN')} VND</p>
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
      <PayrollHeader user={user} />
      <PayrollControls
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        loadData={loadData}
        syncAllData={syncAllData}
        syncing={syncing}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PayrollStatsCards summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
        <PayrollCharts payrollData={payrollData} summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
        <PayrollMetrics summaryStats={summaryStats} selectedPeriod={selectedPeriod} allPayrollData={allPayrollData} />
        <PayrollStatus summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
        <PayrollTables
          employeesData={employeesData}
          timesheetsData={timesheetsData}
          productsData={productsData}
        />
        <PayrollReportsTable allPayrollData={allPayrollData} selectedPeriod={selectedPeriod} />
        <PayrollSummary summaryStats={summaryStats} selectedPeriod={selectedPeriod} />
      </div>
    </div>
  );
}