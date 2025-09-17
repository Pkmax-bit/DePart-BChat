'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TimesheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [timesheet, setTimesheet] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (params.id) {
      fetchTimesheet();
    }
  }, [params.id]);

  const fetchTimesheet = async () => {
    try {
      const response = await fetch(`/api/v1/payroll/bang-cham-cong/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTimesheet(data);
        setFormData(data);
        // Fetch employee info
        const empResponse = await fetch(`/api/v1/payroll/employees/${data.ma_nv}`);
        if (empResponse.ok) {
          const empData = await empResponse.json();
          setEmployee(empData);
        }
      } else if (response.status === 404) {
        router.push('/dashboard/payroll/timesheets');
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/v1/payroll/bang-cham-cong/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thang: parseInt(formData.thang),
          nam: parseInt(formData.nam),
          so_ngay_cong: parseFloat(formData.so_ngay_cong),
          so_gio_tang_ca: parseFloat(formData.so_gio_tang_ca),
          so_ngay_nghi_co_phep: parseInt(formData.so_ngay_nghi_co_phep),
          so_ngay_nghi_khong_phep: parseInt(formData.so_ngay_nghi_khong_phep)
        }),
      });

      if (response.ok) {
        setEditing(false);
        fetchTimesheet();
      } else {
        const error = await response.json();
        alert(error.detail || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating timesheet:', error);
      alert('Có lỗi xảy ra khi cập nhật bảng chấm công');
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

  if (!timesheet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy bảng chấm công</h3>
          <p className="mt-1 text-sm text-gray-500">Bảng chấm công có thể đã bị xóa hoặc không tồn tại</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/payroll/timesheets')}
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
              onClick={() => router.push('/dashboard/payroll/timesheets')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Bảng chấm công tháng {timesheet.thang}/{timesheet.nam}
            </h1>
            <p className="mt-2 text-gray-600">
              {employee ? `${employee.ho_ten} (${timesheet.ma_nv})` : timesheet.ma_nv}
            </p>
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
                    setFormData(timesheet);
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

        {/* Timesheet Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Thông tin chấm công</h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã nhân viên</label>
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                  {timesheet.ma_nv}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                  {employee ? employee.ho_ten : 'Đang tải...'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tháng</label>
                {editing ? (
                  <select
                    required
                    value={formData.thang || ''}
                    onChange={(e) => setFormData({...formData, thang: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {timesheet.thang}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Năm</label>
                {editing ? (
                  <input
                    type="number"
                    required
                    min="2020"
                    max="2030"
                    value={formData.nam || ''}
                    onChange={(e) => setFormData({...formData, nam: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {timesheet.nam}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Số ngày công</label>
                {editing ? (
                  <input
                    type="number"
                    required
                    min="0"
                    max="31"
                    step="0.5"
                    value={formData.so_ngay_cong || ''}
                    onChange={(e) => setFormData({...formData, so_ngay_cong: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {timesheet.so_ngay_cong} ngày
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Số giờ tăng ca</label>
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.so_gio_tang_ca || ''}
                    onChange={(e) => setFormData({...formData, so_gio_tang_ca: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {timesheet.so_gio_tang_ca} giờ
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nghỉ có phép</label>
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    value={formData.so_ngay_nghi_co_phep || ''}
                    onChange={(e) => setFormData({...formData, so_ngay_nghi_co_phep: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {timesheet.so_ngay_nghi_co_phep} ngày
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nghỉ không phép</label>
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    value={formData.so_ngay_nghi_khong_phep || ''}
                    onChange={(e) => setFormData({...formData, so_ngay_nghi_khong_phep: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                    {timesheet.so_ngay_nghi_khong_phep} ngày
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              {editing ? (
                <textarea
                  rows={3}
                  value={formData.ghi_chu || ''}
                  onChange={(e) => setFormData({...formData, ghi_chu: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                  {timesheet.ghi_chu || 'Không có ghi chú'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}