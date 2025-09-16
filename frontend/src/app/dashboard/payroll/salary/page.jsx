'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings, RotateCcw, Save, RefreshCw, Download, Users, Wrench, Eye, EyeOff, X, Package, TrendingDown, Calculator, User, FileSpreadsheet, Clock, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

const supabase = createClientComponentClient();

function SalaryLayout({ user, activeTab, onTabChange, selectedMonth, onMonthChange, children }) {
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'employees', label: 'Nhân viên', icon: Users },
    { id: 'timesheets', label: 'Chấm công', icon: Clock },
    { id: 'products', label: 'Lương sản phẩm', icon: Package },
    { id: 'calculation', label: 'Tính lương', icon: Calculator },
    { id: 'reports', label: 'Báo cáo', icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Tính lương</h1>
              <p className="text-gray-600 mt-1">Tính toán và quản lý lương nhân viên</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email || user?.username || 'Người dùng'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Trực tuyến</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Filter */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Chọn tháng
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => onMonthChange(new Date().toISOString().slice(0, 7))}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tháng hiện tại</span>
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Đang xem:</span> Tháng {selectedMonth}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

function SalaryOverviewTab({ salaryData, selectedMonth }) {
  // Tính tổng lương
  const totalSalary = salaryData.reduce((sum, salary) => sum + (salary.luong_thuc_nhan || 0), 0);
  const employeeCount = salaryData.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng lương</p>
              <p className="text-2xl font-bold text-purple-600">{totalSalary.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Số nhân viên</p>
              <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lương trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {employeeCount > 0 ? (totalSalary / employeeCount).toLocaleString('vi-VN') : 0} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tháng</p>
              <p className="text-2xl font-bold text-gray-900">{selectedMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách lương tháng {selectedMonth}</h3>
        </div>

        {salaryData.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có dữ liệu lương cho tháng này</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {salaryData.map((salary) => (
              <div key={salary.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{salary.ma_nv}</h4>
                      <p className="text-sm text-gray-600">Kỳ: {salary.ky_tinh_luong}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{(salary.luong_thuc_nhan || 0).toLocaleString('vi-VN')} VND</p>
                    <p className="text-sm text-gray-600">Thực nhận</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ lương theo nhân viên</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ma_nv" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), 'Lương']} />
            <Bar dataKey="luong_thuc_nhan" fill="#9333EA" name="Lương thực nhận" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SalaryCalculationTab({ selectedMonth, onSalaryUpdate }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/v1/payroll/nhan-vien');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const calculateSalary = async () => {
    if (!selectedEmployee) {
      alert('Vui lòng chọn nhân viên');
      return;
    }

    setCalculating(true);
    setPayslip(null);

    try {
      // Tạo ky_tinh_luong từ selectedMonth
      const kyTinhLuong = `${selectedMonth}-01`.slice(0, 7).replace('-', '-');

      const response = await fetch('/api/v1/payroll/tinh-luong', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ma_nv: selectedEmployee,
          ky_tinh_luong: kyTinhLuong,
          phu_cap_khac: 0,
          thuong_kpi: 0
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPayslip(data);
        onSalaryUpdate(); // Refresh data
      } else if (response.status === 404) {
        alert('Không tìm thấy dữ liệu lương cho nhân viên này trong tháng đã chọn');
      } else {
        alert('Có lỗi xảy ra khi tính lương');
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      alert('Có lỗi xảy ra khi tính lương');
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getEmployeeName = (ma_nv) => {
    const employee = employees.find(emp => emp.ma_nv === ma_nv);
    return employee ? employee.ho_ten : ma_nv;
  };

  return (
    <div className="space-y-6">
      {/* Calculation Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tính lương nhân viên</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              <option value="">Chọn nhân viên</option>
              {employees.map(employee => (
                <option key={employee.ma_nv} value={employee.ma_nv}>
                  {employee.ho_ten} ({employee.ma_nv})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
            <input
              type="month"
              value={selectedMonth}
              readOnly
              className="block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={calculateSalary}
              disabled={calculating}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tính...
                </>
              ) : (
                'Tính lương'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payslip Display */}
      {payslip && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Phiếu lương</h2>
            <p className="mt-1 text-sm text-gray-600">
              {getEmployeeName(payslip.ma_nv)} - Kỳ {payslip.ky_tinh_luong}
            </p>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Mã nhân viên:</dt>
                    <dd className="text-sm font-medium text-gray-900">{payslip.ma_nv}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Họ tên:</dt>
                    <dd className="text-sm font-medium text-gray-900">{getEmployeeName(payslip.ma_nv)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Kỳ tính lương:</dt>
                    <dd className="text-sm font-medium text-gray-900">{payslip.ky_tinh_luong}</dd>
                  </div>
                </dl>
              </div>

              {/* Chi tiết lương */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Chi tiết lương</h3>
                <dl className="space-y-2">
                  {payslip.chi_tiet_thu_nhap && Object.entries(payslip.chi_tiet_thu_nhap).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-sm text-gray-600">{key}:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(value)}</dd>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-900">Tổng thu nhập:</dt>
                    <dd className="text-sm font-bold text-green-600">{formatCurrency(payslip.tong_thu_nhap || 0)}</dd>
                  </div>
                </dl>
              </div>

              {/* Khấu trừ */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Khấu trừ</h3>
                <dl className="space-y-2">
                  {payslip.chi_tiet_khau_tru && Object.entries(payslip.chi_tiet_khau_tru).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-sm text-gray-600">{key}:</dt>
                      <dd className="text-sm font-medium text-red-600">-{formatCurrency(value)}</dd>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-900">Tổng khấu trừ:</dt>
                    <dd className="text-sm font-bold text-red-600">-{formatCurrency(payslip.tong_khau_tru || 0)}</dd>
                  </div>
                </dl>
              </div>

              {/* Thực lãnh */}
              <div className="md:col-span-2">
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Lương thực nhận:</span>
                    <span className="text-lg font-bold text-purple-600">{formatCurrency(payslip.luong_thuc_nhan || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!payslip && !calculating && (
        <div className="bg-white shadow rounded-lg p-12">
          <div className="text-center">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có phiếu lương</h3>
            <p className="mt-1 text-sm text-gray-500">Chọn nhân viên và tính lương</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SalaryReportsTab({ salaryData, selectedMonth }) {
  const exportToExcel = () => {
    const exportData = salaryData.map(salary => ({
      'Mã NV': salary.ma_nv,
      'Kỳ tính lương': salary.ky_tinh_luong,
      'Tổng thu nhập': salary.tong_thu_nhap || 0,
      'Tổng khấu trừ': salary.tong_khau_tru || 0,
      'Lương thực nhận': salary.luong_thuc_nhan || 0,
      'Ngày tạo': salary.ngay_tao ? new Date(salary.ngay_tao).toLocaleDateString('vi-VN') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lương');

    const fileName = `luong_thang_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo lương tháng {selectedMonth}</h2>
          <p className="text-gray-600 mt-1">Xuất báo cáo lương nhân viên</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={salaryData.length === 0}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỳ tính lương
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng thu nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng khấu trừ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lương thực nhận
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryData.map((salary) => (
                <tr key={salary.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {salary.ma_nv}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {salary.ky_tinh_luong}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(salary.tong_thu_nhap || 0).toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {(salary.tong_khau_tru || 0).toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                    {(salary.luong_thuc_nhan || 0).toLocaleString('vi-VN')} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {salaryData.length === 0 && (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có dữ liệu lương để xuất báo cáo</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    ma_nv: '',
    ho_ten: '',
    chuc_vu: '',
    phong_ban: '',
    luong_hop_dong: '',
    muc_luong_dong_bhxh: '',
    so_nguoi_phu_thuoc: 0,
    email: '',
    dien_thoai: '',
    dia_chi: '',
    ngay_vao_lam: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/v1/payroll/nhan-vien/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEmployee
        ? `/api/v1/payroll/nhan-vien/${editingEmployee.ma_nv}`
        : '/api/v1/payroll/nhan-vien/';

      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingEmployee ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!');
        setShowAddModal(false);
        setEditingEmployee(null);
        resetForm();
        await loadEmployees();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Lỗi kết nối!');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      ma_nv: employee.ma_nv || '',
      ho_ten: employee.ho_ten || '',
      chuc_vu: employee.chuc_vu || '',
      phong_ban: employee.phong_ban || '',
      luong_hop_dong: employee.luong_hop_dong || '',
      muc_luong_dong_bhxh: employee.muc_luong_dong_bhxh || '',
      so_nguoi_phu_thuoc: employee.so_nguoi_phu_thuoc || 0,
      email: employee.email || '',
      dien_thoai: employee.dien_thoai || '',
      dia_chi: employee.dia_chi || '',
      ngay_vao_lam: employee.ngay_vao_lam || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (ma_nv) => {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;

    try {
      const response = await fetch(`/api/v1/payroll/nhan-vien/${ma_nv}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa nhân viên thành công!');
        await loadEmployees();
      } else {
        alert('Lỗi khi xóa nhân viên!');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Lỗi kết nối!');
    }
  };

  const resetForm = () => {
    setFormData({
      ma_nv: '',
      ho_ten: '',
      chuc_vu: '',
      phong_ban: '',
      luong_hop_dong: '',
      muc_luong_dong_bhxh: '',
      so_nguoi_phu_thuoc: 0,
      email: '',
      dien_thoai: '',
      dia_chi: '',
      ngay_vao_lam: ''
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.ma_nv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h2>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa thông tin nhân viên</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã NV, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã NV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chức vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng ban
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lương hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.ma_nv} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.ma_nv}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.ho_ten}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.chuc_vu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.phong_ban}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.luong_hop_dong?.toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.ma_nv)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhân viên</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Không tìm thấy nhân viên phù hợp.' : 'Bắt đầu bằng cách thêm nhân viên đầu tiên.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên *</label>
                    <input
                      type="text"
                      required
                      value={formData.ma_nv}
                      onChange={(e) => setFormData({...formData, ma_nv: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={!!editingEmployee}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.ho_ten}
                      onChange={(e) => setFormData({...formData, ho_ten: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                    <input
                      type="text"
                      value={formData.chuc_vu}
                      onChange={(e) => setFormData({...formData, chuc_vu: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                    <input
                      type="text"
                      value={formData.phong_ban}
                      onChange={(e) => setFormData({...formData, phong_ban: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lương hợp đồng *</label>
                    <input
                      type="number"
                      required
                      value={formData.luong_hop_dong}
                      onChange={(e) => setFormData({...formData, luong_hop_dong: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương đóng BHXH *</label>
                    <input
                      type="number"
                      required
                      value={formData.muc_luong_dong_bhxh}
                      onChange={(e) => setFormData({...formData, muc_luong_dong_bhxh: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số người phụ thuộc</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.so_nguoi_phu_thuoc}
                      onChange={(e) => setFormData({...formData, so_nguoi_phu_thuoc: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào làm</label>
                    <input
                      type="date"
                      value={formData.ngay_vao_lam}
                      onChange={(e) => setFormData({...formData, ngay_vao_lam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input
                      type="tel"
                      value={formData.dien_thoai}
                      onChange={(e) => setFormData({...formData, dien_thoai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    value={formData.dia_chi}
                    onChange={(e) => setFormData({...formData, dia_chi: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEmployee(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingEmployee ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimesheetsTab({ selectedMonth }) {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(selectedMonth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const [formData, setFormData] = useState({
    ma_nv: '',
    ky_tinh_luong: '',
    ngay_cong_chuan: '',
    ngay_cong_thuc_te: '',
    gio_ot_ngay_thuong: 0,
    gio_ot_cuoi_tuan: 0,
    gio_ot_le_tet: 0,
    ghi_chu: ''
  });

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    await Promise.all([loadEmployees(), loadTimesheets()]);
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/v1/payroll/nhan-vien/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadTimesheets = async () => {
    try {
      const response = await fetch(`/api/v1/payroll/bang-cham-cong/?ky_tinh_luong=${selectedPeriod}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setTimesheets(data);
      }
    } catch (error) {
      console.error('Error loading timesheets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTimesheet
        ? `/api/v1/payroll/bang-cham-cong/${editingTimesheet.id}`
        : '/api/v1/payroll/bang-cham-cong/';

      const method = editingTimesheet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingTimesheet ? 'Cập nhật bảng chấm công thành công!' : 'Thêm bảng chấm công thành công!');
        setShowAddModal(false);
        setEditingTimesheet(null);
        resetForm();
        await loadTimesheets();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.detail || 'Có lỗi xảy ra'}`);
      }
    } catch (error) {
      console.error('Error saving timesheet:', error);
      alert('Lỗi kết nối!');
    }
  };

  const handleEdit = (timesheet) => {
    setEditingTimesheet(timesheet);
    setFormData({
      ma_nv: timesheet.ma_nv || '',
      ky_tinh_luong: timesheet.ky_tinh_luong || '',
      ngay_cong_chuan: timesheet.ngay_cong_chuan || '',
      ngay_cong_thuc_te: timesheet.ngay_cong_thuc_te || '',
      gio_ot_ngay_thuong: timesheet.gio_ot_ngay_thuong || 0,
      gio_ot_cuoi_tuan: timesheet.gio_ot_cuoi_tuan || 0,
      gio_ot_le_tet: timesheet.gio_ot_le_tet || 0,
      ghi_chu: timesheet.ghi_chu || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa bảng chấm công này?')) return;

    try {
      const response = await fetch(`/api/v1/payroll/bang-cham-cong/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa bảng chấm công thành công!');
        await loadTimesheets();
      } else {
        alert('Lỗi khi xóa bảng chấm công!');
      }
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      alert('Lỗi kết nối!');
    }
  };

  const resetForm = () => {
    setFormData({
      ma_nv: '',
      ky_tinh_luong: selectedPeriod,
      ngay_cong_chuan: '',
      ngay_cong_thuc_te: '',
      gio_ot_ngay_thuong: 0,
      gio_ot_cuoi_tuan: 0,
      gio_ot_le_tet: 0,
      ghi_chu: ''
    });
  };

  const getEmployeeName = (ma_nv) => {
    const employee = employees.find(emp => emp.ma_nv === ma_nv);
    return employee ? employee.ho_ten : ma_nv;
  };

  const filteredTimesheets = timesheets.filter(timesheet => {
    const employeeName = getEmployeeName(timesheet.ma_nv).toLowerCase();
    const maNV = timesheet.ma_nv.toLowerCase();
    const search = searchTerm.toLowerCase();
    return employeeName.includes(search) || maNV.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý chấm công</h2>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa dữ liệu chấm công nhân viên</p>
        </div>
        <button
          onClick={() => {
            setEditingTimesheet(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chấm công</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ tính lương</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã NV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã NV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỳ lương
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công chuẩn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công thực tế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT Thường
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT Cuối tuần
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OT Lễ tết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTimesheets.map((timesheet) => (
                <tr key={timesheet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {timesheet.ma_nv}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getEmployeeName(timesheet.ma_nv)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.ky_tinh_luong}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {timesheet.ngay_cong_chuan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {timesheet.ngay_cong_thuc_te}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.gio_ot_ngay_thuong}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.gio_ot_cuoi_tuan}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.gio_ot_le_tet}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(timesheet)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(timesheet.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTimesheets.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu chấm công</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Không tìm thấy dữ liệu phù hợp.' : 'Bắt đầu bằng cách thêm dữ liệu chấm công cho kỳ này.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTimesheet ? 'Sửa bảng chấm công' : 'Thêm bảng chấm công'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
                    <select
                      required
                      value={formData.ma_nv}
                      onChange={(e) => setFormData({...formData, ma_nv: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={!!editingTimesheet}
                    >
                      <option value="">Chọn nhân viên</option>
                      {employees.map(employee => (
                        <option key={employee.ma_nv} value={employee.ma_nv}>
                          {employee.ho_ten} ({employee.ma_nv})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ tính lương *</label>
                    <input
                      type="month"
                      required
                      value={formData.ky_tinh_luong}
                      onChange={(e) => setFormData({...formData, ky_tinh_luong: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={!!editingTimesheet}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày công chuẩn *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={formData.ngay_cong_chuan}
                      onChange={(e) => setFormData({...formData, ngay_cong_chuan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày công thực tế *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={formData.ngay_cong_thuc_te}
                      onChange={(e) => setFormData({...formData, ngay_cong_thuc_te: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ OT ngày thường</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.gio_ot_ngay_thuong}
                      onChange={(e) => setFormData({...formData, gio_ot_ngay_thuong: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ OT cuối tuần</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.gio_ot_cuoi_tuan}
                      onChange={(e) => setFormData({...formData, gio_ot_cuoi_tuan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ OT lễ tết</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.gio_ot_le_tet}
                      onChange={(e) => setFormData({...formData, gio_ot_le_tet: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={formData.ghi_chu}
                    onChange={(e) => setFormData({...formData, ghi_chu: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ghi chú về chấm công..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTimesheet(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingTimesheet ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ma_nv: '',
    thang: '',
    nam: '',
    so_luong_san_pham: '',
    don_gia_san_pham: '',
    ghi_chu: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchEmployees();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/payroll/luong-san-pham');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/v1/payroll/nhan-vien');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/payroll/luong-san-pham', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thang: parseInt(formData.thang),
          nam: parseInt(formData.nam),
          so_luong_san_pham: parseInt(formData.so_luong_san_pham),
          don_gia_san_pham: parseFloat(formData.don_gia_san_pham)
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          ma_nv: '',
          thang: '',
          nam: '',
          so_luong_san_pham: '',
          don_gia_san_pham: '',
          ghi_chu: ''
        });
        fetchProducts();
      } else {
        const error = await response.json();
        alert(error.detail || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Có lỗi xảy ra khi tạo lương sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lương sản phẩm này?')) return;

    try {
      const response = await fetch(`/api/v1/payroll/luong-san-pham/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('Có lỗi xảy ra khi xóa lương sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa lương sản phẩm');
    }
  };

  const getEmployeeName = (ma_nv) => {
    const employee = employees.find(emp => emp.ma_nv === ma_nv);
    return employee ? employee.ho_ten : ma_nv;
  };

  const calculateTotal = (so_luong, don_gia) => {
    const total = (so_luong || 0) * (don_gia || 0);
    return total.toLocaleString();
  };

  const filteredProducts = products.filter(product =>
    getEmployeeName(product.ma_nv).toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.ma_nv.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${product.thang}/${product.nam}`.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý lương sản phẩm</h2>
          <p className="text-gray-600 mt-1">Quản lý dữ liệu lương sản phẩm của nhân viên</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lương sản phẩm</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã NV hoặc tháng/năm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProducts.map((product) => (
            <li key={product.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{getEmployeeName(product.ma_nv)}</h3>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product.ma_nv}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Tháng {product.thang}/{product.nam}
                      </div>
                      <div className="text-sm text-gray-500">
                        Số lượng: {product.so_luong_san_pham || 0} | Đơn giá: {(product.don_gia_san_pham || 0).toLocaleString()} VND
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        Tổng: {calculateTotal(product.so_luong_san_pham, product.don_gia_san_pham)} VND
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lương sản phẩm</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm lương sản phẩm mới</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Thêm lương sản phẩm mới</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nhân viên *</label>
                  <select
                    required
                    value={formData.ma_nv}
                    onChange={(e) => setFormData({...formData, ma_nv: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map(employee => (
                      <option key={employee.ma_nv} value={employee.ma_nv}>
                        {employee.ho_ten} ({employee.ma_nv})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tháng *</label>
                  <select
                    required
                    value={formData.thang}
                    onChange={(e) => setFormData({...formData, thang: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  >
                    <option value="">Chọn tháng</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Năm *</label>
                  <input
                    type="number"
                    required
                    min="2020"
                    max="2030"
                    value={formData.nam}
                    onChange={(e) => setFormData({...formData, nam: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số lượng sản phẩm *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.so_luong_san_pham}
                    onChange={(e) => setFormData({...formData, so_luong_san_pham: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đơn giá sản phẩm *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.don_gia_san_pham}
                    onChange={(e) => setFormData({...formData, don_gia_san_pham: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tổng tiền</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {formData.so_luong_san_pham && formData.don_gia_san_pham
                      ? ((parseInt(formData.so_luong_san_pham) || 0) * (parseFloat(formData.don_gia_san_pham) || 0)).toLocaleString()
                      : '0'} VND
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                <textarea
                  rows={3}
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData({...formData, ghi_chu: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Thêm lương sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalaryPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryData, setSalaryData] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth]);

  const fetchSalaryData = async () => {
    try {
      const response = await fetch(`/api/v1/payroll/phieu-luong?ky_tinh_luong=${selectedMonth.replace('-', '-')}`);
      if (response.ok) {
        const data = await response.json();
        setSalaryData(data);
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
    }
  };

  const handleSalaryUpdate = () => {
    fetchSalaryData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SalaryOverviewTab salaryData={salaryData} selectedMonth={selectedMonth} />;
      case 'employees':
        return <EmployeesTab />;
      case 'timesheets':
        return <TimesheetsTab selectedMonth={selectedMonth} />;
      case 'products':
        return <ProductsTab />;
      case 'calculation':
        return <SalaryCalculationTab selectedMonth={selectedMonth} onSalaryUpdate={handleSalaryUpdate} />;
      case 'reports':
        return <SalaryReportsTab salaryData={salaryData} selectedMonth={selectedMonth} />;
      default:
        return <SalaryOverviewTab salaryData={salaryData} selectedMonth={selectedMonth} />;
    }
  };

  return (
    <SalaryLayout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
    >
      {renderTabContent()}
    </SalaryLayout>
  );
}