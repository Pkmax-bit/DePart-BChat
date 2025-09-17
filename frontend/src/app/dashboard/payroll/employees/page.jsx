'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Users, Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmployeesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
        await loadEmployees();
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setLoading(false);
        await loadEmployees();
      }
    };
    getUser();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/payroll/employees/', {
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
        ? `http://localhost:8001/api/v1/payroll/employees/${editingEmployee.ma_nv}`
        : 'http://localhost:8001/api/v1/payroll/employees/';

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
      const response = await fetch(`http://localhost:8001/api/v1/payroll/employees/${ma_nv}`, {
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
                <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
                <p className="text-sm text-gray-600">Thêm, sửa, xóa thông tin nhân viên</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingEmployee(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhân viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã NV, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Employees Table */}
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
                          className="text-blue-600 hover:text-blue-900"
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
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhân viên</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Không tìm thấy nhân viên phù hợp.' : 'Bắt đầu bằng cách thêm nhân viên đầu tiên.'}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                    <input
                      type="text"
                      value={formData.chuc_vu}
                      onChange={(e) => setFormData({...formData, chuc_vu: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                    <input
                      type="text"
                      value={formData.phong_ban}
                      onChange={(e) => setFormData({...formData, phong_ban: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lương hợp đồng *</label>
                    <input
                      type="number"
                      required
                      value={formData.luong_hop_dong}
                      onChange={(e) => setFormData({...formData, luong_hop_dong: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương đóng BHXH *</label>
                    <input
                      type="number"
                      required
                      value={formData.muc_luong_dong_bhxh}
                      onChange={(e) => setFormData({...formData, muc_luong_dong_bhxh: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số người phụ thuộc</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.so_nguoi_phu_thuoc}
                      onChange={(e) => setFormData({...formData, so_nguoi_phu_thuoc: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào làm</label>
                    <input
                      type="date"
                      value={formData.ngay_vao_lam}
                      onChange={(e) => setFormData({...formData, ngay_vao_lam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input
                      type="tel"
                      value={formData.dien_thoai}
                      onChange={(e) => setFormData({...formData, dien_thoai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    value={formData.dia_chi}
                    onChange={(e) => setFormData({...formData, dia_chi: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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