'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Clock, Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TimesheetsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
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
    await Promise.all([loadEmployees(), loadTimesheets()]);
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/payroll/nhan-vien/', {
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
      const response = await fetch(`http://localhost:8001/api/v1/payroll/bang-cham-cong/?ky_tinh_luong=${selectedPeriod}`, {
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
        ? `http://localhost:8001/api/v1/payroll/bang-cham-cong/${editingTimesheet.id}`
        : 'http://localhost:8001/api/v1/payroll/bang-cham-cong/';

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
      const response = await fetch(`http://localhost:8001/api/v1/payroll/bang-cham-cong/${id}`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-700">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/payroll"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý chấm công</h1>
                <p className="text-sm text-gray-600">Thêm, sửa, xóa dữ liệu chấm công nhân viên</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingTimesheet(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm chấm công</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ tính lương</label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Timesheets Table */}
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
                          className="text-blue-600 hover:text-blue-900"
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
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dữ liệu chấm công</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Không tìm thấy dữ liệu phù hợp.' : 'Bắt đầu bằng cách thêm dữ liệu chấm công cho kỳ này.'}
              </p>
            </div>
          )}
        </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={formData.ghi_chu}
                    onChange={(e) => setFormData({...formData, ghi_chu: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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