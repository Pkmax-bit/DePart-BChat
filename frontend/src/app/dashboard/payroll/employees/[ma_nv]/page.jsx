'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (params.ma_nv) {
      fetchEmployee();
    }
  }, [params.ma_nv]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/v1/payroll/nhan-vien/${params.ma_nv}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        setFormData(data);
      } else if (response.status === 404) {
        router.push('/dashboard/payroll/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/v1/payroll/nhan-vien/${params.ma_nv}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          luong_hop_dong: parseFloat(formData.luong_hop_dong),
          muc_luong_dong_bhxh: parseFloat(formData.muc_luong_dong_bhxh),
          so_nguoi_phu_thuoc: parseInt(formData.so_nguoi_phu_thuoc)
        }),
      });

      if (response.ok) {
        setEditing(false);
        fetchEmployee();
      } else {
        const error = await response.json();
        alert(error.detail || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Có lỗi xảy ra khi cập nhật nhân viên');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy nhân viên</h3>
          <p className="mt-1 text-sm text-gray-500">Nhân viên có thể đã bị xóa hoặc không tồn tại</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/payroll/employees')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push('/dashboard/payroll/employees')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{employee.ho_ten}</h1>
            <p className="mt-2 text-gray-600">Mã nhân viên: {employee.ma_nv}</p>
          </div>
          <div className="flex space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(employee);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Employee Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Thông tin nhân viên</h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã nhân viên</label>
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                  {employee.ma_nv}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                {editing ? (
                  <input
                    type="text"
                    required
                    value={formData.ho_ten || ''}
                    onChange={(e) => setFormData({...formData, ho_ten: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.ho_ten}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.chuc_vu || ''}
                    onChange={(e) => setFormData({...formData, chuc_vu: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.chuc_vu || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phong_ban || ''}
                    onChange={(e) => setFormData({...formData, phong_ban: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.phong_ban || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lương hợp đồng</label>
                {editing ? (
                  <input
                    type="number"
                    required
                    value={formData.luong_hop_dong || ''}
                    onChange={(e) => setFormData({...formData, luong_hop_dong: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.luong_hop_dong?.toLocaleString()} VND
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mức lương đóng BHXH</label>
                {editing ? (
                  <input
                    type="number"
                    required
                    value={formData.muc_luong_dong_bhxh || ''}
                    onChange={(e) => setFormData({...formData, muc_luong_dong_bhxh: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.muc_luong_dong_bhxh?.toLocaleString()} VND
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Số người phụ thuộc</label>
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    value={formData.so_nguoi_phu_thuoc || 0}
                    onChange={(e) => setFormData({...formData, so_nguoi_phu_thuoc: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.so_nguoi_phu_thuoc || 0}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày vào làm</label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.ngay_vao_lam || ''}
                    onChange={(e) => setFormData({...formData, ngay_vao_lam: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.ngay_vao_lam ? new Date(employee.ngay_vao_lam).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.email || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Điện thoại</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.dien_thoai || ''}
                    onChange={(e) => setFormData({...formData, dien_thoai: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {employee.dien_thoai || 'Chưa cập nhật'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              {editing ? (
                <textarea
                  rows={3}
                  value={formData.dia_chi || ''}
                  onChange={(e) => setFormData({...formData, dia_chi: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                  {employee.dia_chi || 'Chưa cập nhật'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}