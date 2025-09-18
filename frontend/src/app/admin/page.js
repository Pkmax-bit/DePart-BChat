'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking admin authentication...');

      // Kiểm tra Supabase session (cho Admin)
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Supabase session check:', { session: !!session, error });

      if (session && !error) {
        console.log('Admin session found:', session.user.email);
        setUser(session.user);
        return;
      }

      // Kiểm tra localStorage session (cho User/Manager)
      const localSession = localStorage.getItem('user_session');
      console.log('Local session check:', !!localSession);

      if (localSession) {
        const sessionData = JSON.parse(localSession);
        console.log('Local session data:', {
          userId: sessionData.user?.id,
          role: sessionData.role,
          loginTime: sessionData.login_time
        });

        // Kiểm tra role admin
        if (sessionData.role === 'admin') {
          // Kiểm tra session expiry (24 giờ)
          const loginTime = new Date(sessionData.login_time);
          const now = new Date();
          const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

          if (hoursDiff > 24) {
            console.log('Session expired, clearing...');
            localStorage.removeItem('user_session');
            router.push('/login');
            return;
          }

          setUser(sessionData.user);
          return;
        } else {
          console.log('User is not admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
      }

      // Không có session hợp lệ
      console.log('No valid admin session found, redirecting to login');
      router.push('/login');
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Đang tải...</p>
      </div>
    );
  }

  return (
    <AdminLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'chatflows' && <ChatflowManagement />}
      {activeTab === 'departments' && <DepartmentManagement />}
      {activeTab === 'feedback' && <FeedbackManagement />}
      {activeTab === 'user-chat-history' && <UserChatHistoryManagement />}
      {activeTab === 'chat-history' && <ChatHistoryManagement />}
      {activeTab === 'notifications' && <NotificationManagement />}
    </AdminLayout>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role_id: 2,
    department_id: null,
    // Employee fields
    ma_nv: '',
    chuc_vu: '',
    phong_ban: '',
    luong_hop_dong: '',
    muc_luong_dong_bhxh: '',
    so_nguoi_phu_thuoc: 0,
    dien_thoai: '',
    dia_chi: '',
    ngay_vao_lam: ''
  });
  const [editUser, setEditUser] = useState({
    email: '',
    full_name: '',
    role_id: 2,
    department_id: null,
    is_active: true
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // Effect to refetch users when search is triggered
  useEffect(() => {
    if (searchTriggered) {
      fetchUsers();
      setSearchTriggered(false); // Reset trigger
    }
  }, [searchTriggered]);

  const fetchUsers = async () => {
    try {
      setIsSearching(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedDepartment) {
        params.append('department_id', selectedDepartment);
      }
      
      const queryString = params.toString();
      const url = `http://localhost:8001/api/v1/users/${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        // headers: {
        //   'Authorization': session ? `Bearer ${session.access_token}` : ''
        // }
      });
      if (response.ok) {
        const data = await response.json();
        // API trả về {users: [...]}
        setUsers(data.users || data || []);
        setHasSearched(true); // Mark that search has been performed
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/departments/');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const downloadSampleFile = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/sample-files/bulk-upload-template');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_upload_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Không thể tải file mẫu. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error downloading sample file:', error);
      alert('Lỗi kết nối đến server!');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    console.log('Submitting unified employee data:', newUser); // Debug log

    try {
      // Create unified employee record
      const employeeData = {
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.full_name,
        role_id: newUser.role_id,
        department_id: newUser.department_id,
        // Employee-specific fields
        ma_nv: newUser.ma_nv,
        chuc_vu: newUser.chuc_vu,
        phong_ban: newUser.phong_ban,
        luong_hop_dong: parseFloat(newUser.luong_hop_dong) || 0,
        muc_luong_dong_bhxh: parseFloat(newUser.muc_luong_dong_bhxh) || 0,
        so_nguoi_phu_thuoc: newUser.so_nguoi_phu_thuoc || 0,
        dien_thoai: newUser.dien_thoai,
        dia_chi: newUser.dia_chi,
        ngay_vao_lam: newUser.ngay_vao_lam
      };

      console.log('Creating unified employee with data:', employeeData);

      const response = await fetch('http://localhost:8001/api/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData)
      });

      console.log('Employee creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creating employee:', errorText);
        alert('Lỗi tạo nhân viên: ' + errorText);
        return;
      }

      const result = await response.json();
      console.log('Employee creation success result:', result);

      // Success - reset form and refresh list
      setShowAddForm(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role_id: 2,
        department_id: null,
        // Employee fields
        ma_nv: '',
        chuc_vu: '',
        phong_ban: '',
        luong_hop_dong: '',
        muc_luong_dong_bhxh: '',
        so_nguoi_phu_thuoc: 0,
        dien_thoai: '',
        dia_chi: '',
        ngay_vao_lam: ''
      });
      fetchUsers();
      alert('Đã tạo nhân viên thành công!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Lỗi kết nối đến server: ' + error.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8001/api/v1/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify(editUser)
      });
      if (response.ok) {
        setShowEditForm(false);
        setEditingUser(null);
        setEditUser({
          email: '',
          full_name: '',
          role_id: 2,
          department_id: null,
          is_active: true,
          // Employee fields
          ma_nv: '',
          chuc_vu: '',
          phong_ban: '',
          luong_hop_dong: '',
          muc_luong_dong_bhxh: '',
          so_nguoi_phu_thuoc: 0,
          dien_thoai: '',
          dia_chi: '',
          ngay_vao_lam: ''
        });
        fetchUsers();
        alert('Đã cập nhật nhân viên thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật nhân viên!');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Có lỗi xảy ra khi cập nhật nhân viên!');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      return;
    }

    setDeletingUser(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8001/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': session ? `Bearer ${session.access_token}` : ''
        }
      });
      if (response.ok) {
        fetchUsers();
        alert('Đã xóa nhân viên thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa nhân viên!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa nhân viên!');
    } finally {
      setDeletingUser(null);
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setEditUser({
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id || 2,
      department_id: user.department_id,
      is_active: user.is_active,
      // Employee fields
      ma_nv: user.ma_nv || '',
      chuc_vu: user.chuc_vu || '',
      phong_ban: user.phong_ban || '',
      luong_hop_dong: user.luong_hop_dong || '',
      muc_luong_dong_bhxh: user.muc_luong_dong_bhxh || '',
      so_nguoi_phu_thuoc: user.so_nguoi_phu_thuoc || 0,
      dien_thoai: user.dien_thoai || '',
      dia_chi: user.dia_chi || '',
      ngay_vao_lam: user.ngay_vao_lam ? user.ngay_vao_lam.split('T')[0] : ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    if (!isSearching) {
      setSearchTriggered(true);
    }
  };

  const handleDepartmentFilterChange = (e) => {
    setSelectedDepartment(e.target.value);
    // Auto-search for department filter
    setSearchTriggered(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setHasSearched(false); // Reset search state
    setSearchTriggered(true);
  };



  if (loading) {
    return <div className="p-6">Đang tải danh sách người dùng...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Quản lý Nhân viên</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={downloadSampleFile}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Tải File Mẫu</span>
            <span className="sm:hidden">Mẫu</span>
          </button>
          <label className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 cursor-pointer text-sm sm:text-base flex items-center justify-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                console.log('File selected and auto-uploading:', file);
                setUploading(true);
                setUploadResult(null);
                setShowBulkUpload(true); // Show the modal to display results

                try {
                  const formData = new FormData();
                  formData.append('file', file);

                  const response = await fetch('http://localhost:8001/api/v1/users/bulk-upload', {
                    method: 'POST',
                    body: formData
                  });

                  const result = await response.json();

                  if (response.ok) {
                    setUploadResult({
                      success: true,
                      message: `Upload thành công! Đã tạo ${result.created_count || 0} nhân viên.`,
                      data: result
                    });
                    fetchUsers(); // Refresh the user list
                  } else {
                    setUploadResult({
                      success: false,
                      message: result.detail || 'Có lỗi xảy ra khi upload file!',
                      data: result
                    });
                  }
                } catch (error) {
                  console.error('Error uploading file:', error);
                  setUploadResult({
                    success: false,
                    message: 'Lỗi kết nối đến server!'
                  });
                } finally {
                  setUploading(false);
                }
              }}
              className="hidden"
            />
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Upload Hàng Loạt</span>
            <span className="sm:hidden">Upload</span>
          </label>
          <button
            onClick={() => {
              setShowAddForm(true);
              setShowEditForm(false);
              setEditingUser(null);
              // Scroll to top to show the form
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Thêm Nhân viên</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form - hiển thị trực tiếp thay vì modal */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Thêm Nhân viên Mới</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Đóng form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAddUser} className="space-y-6">
            {/* User Information Section */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Thông tin tài khoản</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                <select
                  value={newUser.department_id || ''}
                  onChange={(e) => setNewUser({...newUser, department_id: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Không thuộc phòng ban nào</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Information Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">Thông tin nhân viên</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã nhân viên <span className="text-xs text-gray-500">(tự động tạo số nếu để trống)</span></label>
                  <input
                    type="text"
                    value={newUser.ma_nv}
                    onChange={(e) => setNewUser({...newUser, ma_nv: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                  <input
                    type="text"
                    value={newUser.chuc_vu}
                    onChange={(e) => setNewUser({...newUser, chuc_vu: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban (nhân viên)</label>
                  <input
                    type="text"
                    value={newUser.phong_ban}
                    onChange={(e) => setNewUser({...newUser, phong_ban: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số người phụ thuộc</label>
                  <input
                    type="number"
                    value={newUser.so_nguoi_phu_thuoc}
                    onChange={(e) => setNewUser({...newUser, so_nguoi_phu_thuoc: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lương hợp đồng</label>
                  <input
                    type="number"
                    value={newUser.luong_hop_dong}
                    onChange={(e) => setNewUser({...newUser, luong_hop_dong: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mức lương đóng BHXH</label>
                  <input
                    type="number"
                    value={newUser.muc_luong_dong_bhxh}
                    onChange={(e) => setNewUser({...newUser, muc_luong_dong_bhxh: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điện thoại</label>
                  <input
                    type="tel"
                    value={newUser.dien_thoai}
                    onChange={(e) => setNewUser({...newUser, dien_thoai: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày vào làm</label>
                  <input
                    type="date"
                    value={newUser.ngay_vao_lam}
                    onChange={(e) => setNewUser({...newUser, ngay_vao_lam: e.target.value})}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <textarea
                  value={newUser.dia_chi}
                  onChange={(e) => setNewUser({...newUser, dia_chi: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm Nhân viên
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Sửa Nhân viên</h3>
            <button
              onClick={() => {setShowEditForm(false); setEditingUser(null);}}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Đóng form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleEditUser} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã nhân viên</label>
                <input
                  type="text"
                  value={editUser.ma_nv}
                  onChange={(e) => setEditUser({...editUser, ma_nv: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                value={editUser.full_name}
                onChange={(e) => setEditUser({...editUser, full_name: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
              <select
                value={editUser.department_id || ''}
                onChange={(e) => setEditUser({...editUser, department_id: e.target.value ? parseInt(e.target.value) : null})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Không thuộc phòng ban nào</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={editUser.is_active}
                onChange={(e) => setEditUser({...editUser, is_active: e.target.value === 'true'})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={true}>Hoạt động</option>
                <option value={false}>Không hoạt động</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                <input
                  type="text"
                  value={editUser.chuc_vu}
                  onChange={(e) => setEditUser({...editUser, chuc_vu: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban (nhân viên)</label>
                <input
                  type="text"
                  value={editUser.phong_ban}
                  onChange={(e) => setEditUser({...editUser, phong_ban: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số người phụ thuộc</label>
                <input
                  type="number"
                  value={editUser.so_nguoi_phu_thuoc}
                  onChange={(e) => setEditUser({...editUser, so_nguoi_phu_thuoc: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lương hợp đồng</label>
                <input
                  type="number"
                  value={editUser.luong_hop_dong}
                  onChange={(e) => setEditUser({...editUser, luong_hop_dong: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mức lương đóng BHXH</label>
                <input
                  type="number"
                  value={editUser.muc_luong_dong_bhxh}
                  onChange={(e) => setEditUser({...editUser, muc_luong_dong_bhxh: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Điện thoại</label>
                <input
                  type="tel"
                  value={editUser.dien_thoai}
                  onChange={(e) => setEditUser({...editUser, dien_thoai: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày vào làm</label>
                <input
                  type="date"
                  value={editUser.ngay_vao_lam}
                  onChange={(e) => setEditUser({...editUser, ngay_vao_lam: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
              <textarea
                value={editUser.dia_chi}
                onChange={(e) => setEditUser({...editUser, dia_chi: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Kết quả Upload</h3>
              
              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang upload file...</p>
                </div>
              )}

              {uploadResult && (
                <div className={`mb-4 p-3 sm:p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${uploadResult.success ? 'bg-green-500' : 'bg-red-500'}`}>
                      {uploadResult.success ? '✓' : '✗'}
                    </div>
                    <p className="text-sm font-medium">{uploadResult.message}</p>
                  </div>
                  
                  {uploadResult.data && uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-700 mb-2">Chi tiết lỗi:</p>
                      <div className="bg-red-100 p-3 rounded border max-h-32 overflow-y-auto">
                        <ul className="text-sm text-red-800 space-y-1">
                          {uploadResult.data.errors.map((error, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                              <span className="break-words">{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {uploadResult.data && uploadResult.data.created_users && uploadResult.data.created_users.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-700 mb-2">Đã tạo thành công ({uploadResult.data.created_users.length} nhân viên):</p>
                      <div className="bg-green-100 p-3 rounded border max-h-32 overflow-y-auto">
                        <ul className="text-sm text-green-800 space-y-1">
                          {uploadResult.data.created_users.map((user, index) => (
                            <li key={index} className="flex items-center">
                              <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                              <span className="font-medium truncate mr-2">{user.full_name}</span>
                              <span className="text-gray-600 text-xs truncate">({user.email})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowBulkUpload(false);
                    setUploadResult(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchClick();
                }
              }}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <select
              value={selectedDepartment}
              onChange={handleDepartmentFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearchClick}
              disabled={isSearching}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tìm...
                </>
              ) : (
                <>
                  🔍 Tìm kiếm
                </>
              )}
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
        {(searchTerm || selectedDepartment) && (
          <div className="mt-2 text-sm text-gray-600">
            {searchTerm && <span>Tìm kiếm: "{searchTerm}"</span>}
            {searchTerm && selectedDepartment && <span> • </span>}
            {selectedDepartment && (
              <span>
                Phòng ban: {departments.find(d => d.id.toString() === selectedDepartment)?.name || 'N/A'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Họ và tên</span>
                  <span className="sm:hidden">Tên</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Phòng ban</span>
                  <span className="sm:hidden">PB</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Trạng thái</span>
                  <span className="sm:hidden">TT</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Thao tác</span>
                  <span className="sm:hidden">...</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 && hasSearched ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg font-medium">Không tìm thấy nhân viên phù hợp</p>
                      <p className="text-sm">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="hidden sm:inline">{user.email}</span>
                      <span className="sm:hidden">{user.email.split('@')[0]}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.departments?.name || 'Chưa phân công'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span className="hidden sm:inline">{user.is_active ? 'Hoạt động' : 'Không hoạt động'}</span>
                        <span className="sm:hidden">{user.is_active ? '✓' : '✗'}</span>
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1 sm:space-x-3">
                        <button 
                          onClick={() => openEditForm(user)}
                          className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Sửa nhân viên"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUser === user.id}
                          className="px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Xóa nhân viên"
                        >
                          {deletingUser === user.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChatflowManagement() {
  const [chatflows, setChatflows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingChatflow, setEditingChatflow] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [deletingChatflow, setDeletingChatflow] = useState(null);
  const [newChatflow, setNewChatflow] = useState({ name: '', embed_url: '', department_id: null });
  const [editChatflow, setEditChatflow] = useState({ name: '', embed_url: '', department_id: null });

  useEffect(() => {
    fetchChatflows();
    fetchDepartments();
  }, []);

  const fetchChatflows = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('http://localhost:8001/api/v1/chatflows/', {
        // headers: {
        //   'Authorization': session ? `Bearer ${session.access_token}` : ''
        // }
      });
      if (response.ok) {
        const data = await response.json();
        setChatflows(data);
      }
    } catch (error) {
      console.error('Error fetching chatflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/departments/');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleAddChatflow = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('http://localhost:8001/api/v1/chatflows/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify(newChatflow)
      });
      if (response.ok) {
        setShowAddForm(false);
        setNewChatflow({ name: '', embed_url: '', department_id: null });
        fetchChatflows();
      }
    } catch (error) {
      console.error('Error adding chatflow:', error);
    }
  };

  const handleEditChatflow = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8001/api/v1/chatflows/${editingChatflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify(editChatflow)
      });
      if (response.ok) {
        setShowEditForm(false);
        setEditingChatflow(null);
        setEditChatflow({ name: '', embed_url: '', department_id: null });
        fetchChatflows();
      }
    } catch (error) {
      console.error('Error updating chatflow:', error);
    }
  };

  const handleToggleStatus = async (chatflowId, currentStatus) => {
    setTogglingStatus(chatflowId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8001/api/v1/chatflows/${chatflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ is_enabled: !currentStatus })
      });
      if (response.ok) {
        fetchChatflows();
      }
    } catch (error) {
      console.error('Error toggling chatflow status:', error);
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDeleteChatflow = async (chatflowId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chatflow này?')) {
      return;
    }

    setDeletingChatflow(chatflowId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8001/api/v1/chatflows/${chatflowId}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': session ? `Bearer ${session.access_token}` : ''
        }
      });
      if (response.ok) {
        fetchChatflows();
        alert('Đã xóa chatflow thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa chatflow!');
      }
    } catch (error) {
      console.error('Error deleting chatflow:', error);
      alert('Có lỗi xảy ra khi xóa chatflow!');
    } finally {
      setDeletingChatflow(null);
    }
  };

  const openEditForm = (chatflow) => {
    setEditingChatflow(chatflow);
    setEditChatflow({ 
      name: chatflow.name, 
      embed_url: chatflow.embed_url,
      department_id: chatflow.department_id
    });
    setShowEditForm(true);
  };

  if (loading) {
    return <div className="p-6">Đang tải danh sách chatflows...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Quản lý Chatflow</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
        >
          Thêm Chatflow
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Thêm Chatflow Mới</h3>
          <form onSubmit={handleAddChatflow}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Tên Chatflow</label>
              <input
                type="text"
                value={newChatflow.name}
                onChange={(e) => setNewChatflow({...newChatflow, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">URL Nhúng (Dify)</label>
              <input
                type="url"
                value={newChatflow.embed_url}
                onChange={(e) => setNewChatflow({...newChatflow, embed_url: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
              <select
                value={newChatflow.department_id || ''}
                onChange={(e) => setNewChatflow({...newChatflow, department_id: e.target.value ? parseInt(e.target.value) : null})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Thêm
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Sửa Chatflow</h3>
          <form onSubmit={handleEditChatflow}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Tên Chatflow</label>
              <input
                type="text"
                value={editChatflow.name}
                onChange={(e) => setEditChatflow({...editChatflow, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">URL Nhúng (Dify)</label>
              <input
                type="url"
                value={editChatflow.embed_url}
                onChange={(e) => setEditChatflow({...editChatflow, embed_url: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
              <select
                value={editChatflow.department_id || ''}
                onChange={(e) => setEditChatflow({...editChatflow, department_id: e.target.value ? parseInt(e.target.value) : null})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black"
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Cập nhật
              </button>
              <button type="button" onClick={() => {setShowEditForm(false); setEditingChatflow(null);}} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Tên</span>
                  <span className="sm:hidden">Tên</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Phòng ban</span>
                  <span className="sm:hidden">PB</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">URL Nhúng</span>
                  <span className="sm:hidden">URL</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Trạng thái</span>
                  <span className="sm:hidden">TT</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Thao tác</span>
                  <span className="sm:hidden">...</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chatflows.map((chatflow) => (
                <tr key={chatflow.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chatflow.name}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chatflow.departments?.name || 'Chưa phân công'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    <span className="hidden sm:inline">{chatflow.embed_url}</span>
                    <span className="sm:hidden">{chatflow.embed_url.substring(0, 20)}...</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      chatflow.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="hidden sm:inline">{chatflow.is_enabled ? 'Bật' : 'Tắt'}</span>
                      <span className="sm:hidden">{chatflow.is_enabled ? '✓' : '✗'}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-3">
                      <button
                        onClick={() => handleToggleStatus(chatflow.id, chatflow.is_enabled)}
                        disabled={togglingStatus === chatflow.id}
                        className={`px-2 sm:px-3 py-1 text-xs rounded transition-colors ${
                          chatflow.is_enabled 
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50`}
                        title={chatflow.is_enabled ? 'Tắt chatflow' : 'Bật chatflow'}
                      >
                        {togglingStatus === chatflow.id ? '⏳' : (chatflow.is_enabled ? '🚫' : '✅')}
                      </button>
                      <button 
                        onClick={() => openEditForm(chatflow)}
                        className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Sửa chatflow"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteChatflow(chatflow.id)}
                        disabled={deletingChatflow === chatflow.id}
                        className="px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Xóa chatflow"
                      >
                        {deletingChatflow === chatflow.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setError(null);
      
      // Try Supabase Auth first (for Admin users created in Supabase)
      const { data: { session } } = await supabase.auth.getSession();
      
      let headers = {};
      let authMethod = '';
      
      if (session) {
        // Use Supabase Auth token
        headers = {
          'Authorization': `Bearer ${session.access_token}`
        };
        authMethod = 'Supabase Auth';
      } else {
        // Check localStorage session (for users authenticated via local users table)
        const localSession = localStorage.getItem('user_session');
        if (localSession) {
          const sessionData = JSON.parse(localSession);
          if (sessionData.role === 'admin') {
            // For local authentication, we'll use a special header or modify the endpoint
            // Since the backend expects JWT, we need to either:
            // 1. Create a temporary JWT token, or
            // 2. Modify the backend to accept local auth, or
            // 3. Use the test endpoint for now
            
            console.log('Using local authentication for admin');
            authMethod = 'Local Auth';
            
            // For now, use the test endpoint which doesn't require authentication
            const response = await fetch('http://localhost:8001/api/v1/users/activity/logs/test');
            
            if (response.ok) {
              const data = await response.json();
              console.log('Activity logs data (local auth):', data);
              setLogs(data.activity_logs || []);
              return;
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } else {
            throw new Error('User is not admin');
          }
        } else {
          throw new Error('No authentication found');
        }
      }

      console.log(`Fetching activity logs using ${authMethod}...`);
      const response = await fetch('http://localhost:8001/api/v1/users/activity/logs', {
        headers: headers
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Activity logs data:', data);
        setLogs(data.activity_logs || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch activity logs:', response.status, errorText);
        setError(`Lỗi khi tải dữ liệu: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải activity logs...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchActivityLogs}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        <button
          onClick={fetchActivityLogs}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Hoạt động
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Trạng thái Online
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Chưa có hoạt động nào được ghi lại
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {(log.users?.full_name || log.users?.email || 'N/A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {log.users?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.users?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {log.action_type === 'login' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🔓 Đăng nhập
                        </span>
                      )}
                      {log.action_type === 'logout' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔒 Đăng xuất
                        </span>
                      )}
                      {log.action_type === 'access' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          💬 Truy cập Chatflow
                        </span>
                      )}
                      <span className="ml-2">
                        {log.action_type === 'access' 
                          ? (log.chatflows?.name || `Chatflow ID: ${log.chatflow_id}`)
                          : ''
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.online_status === true && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                        Online
                      </span>
                    )}
                    {log.online_status === false && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                        Offline
                      </span>
                    )}
                    {log.online_status === null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-1.5"></span>
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.access_time ? new Date(log.access_time).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng cộng: {logs.length} hoạt động
        </div>
      )}
    </div>
  );
}

function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingFeedback, setDeletingFeedback] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No Supabase session for admin');
        return;
      }

      const response = await fetch('http://localhost:8001/api/v1/feedback/', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data || []);
      } else {
        console.error('Failed to fetch feedbacks:', response.status);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    setUpdatingStatus(feedbackId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No Supabase session for admin');
        return;
      }

      const response = await fetch(`http://localhost:8001/api/v1/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh the feedback list
        fetchFeedbacks();
      } else {
        console.error('Failed to update feedback status:', response.status);
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa góp ý này?')) {
      return;
    }

    setDeletingFeedback(feedbackId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No Supabase session for admin');
        return;
      }

      const response = await fetch(`http://localhost:8001/api/v1/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        // Refresh the feedback list
        fetchFeedbacks();
        alert('Đã xóa góp ý thành công!');
      } else {
        console.error('Failed to delete feedback:', response.status);
        alert('Có lỗi xảy ra khi xóa góp ý!');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Có lỗi xảy ra khi xóa góp ý!');
    } finally {
      setDeletingFeedback(null);
    }
  };

  const editFeedback = (feedback) => {
    // For now, just show an alert. In a real app, you might open a modal to edit
    alert(`Chức năng sửa góp ý sẽ được phát triển sau. ID: ${feedback.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải danh sách góp Ý...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Góp Ý</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                ID Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Ưu tiên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbacks.map((feedback) => (
              <tr key={feedback.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {feedback.user_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={feedback.subject}>
                  {feedback.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {feedback.category === 'general' ? 'Tổng quát' :
                   feedback.category === 'bug' ? 'Lỗi' :
                   feedback.category === 'feature' ? 'Tính năng' :
                   feedback.category === 'improvement' ? 'Cải thiện' : feedback.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(feedback.priority)}`}>
                    {feedback.priority === 'low' ? 'Thấp' :
                     feedback.priority === 'medium' ? 'Trung bình' :
                     feedback.priority === 'high' ? 'Cao' :
                     feedback.priority === 'urgent' ? 'Khẩn cấp' : feedback.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                    {feedback.status === 'pending' ? 'Chờ xử lý' :
                     feedback.status === 'in_review' ? 'Đang xử lý' :
                     feedback.status === 'resolved' ? 'Đã giải quyết' :
                     feedback.status === 'closed' ? 'Đã đóng' : feedback.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(feedback.created_at).toLocaleString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <select
                      value={feedback.status}
                      onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                      disabled={updatingStatus === feedback.id}
                      className="text-sm border border-gray-300 rounded px-3 py-1 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="in_review">Đang xử lý</option>
                      <option value="resolved">Đã giải quyết</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                    <div className="flex space-x-1">
                      
                      <button 
                        onClick={() => deleteFeedback(feedback.id)}
                        disabled={updatingStatus === feedback.id || deletingFeedback === feedback.id}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Xóa góp ý"
                      >
                        {deletingFeedback === feedback.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-8 text-gray-700">
          Chưa có góp Ý nào từ nhân viên.
        </div>
      )}
    </div>
  );
}

/* Duplicate DepartmentManagement function removed. */
function ChatHistoryManagement() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedConversations, setExpandedConversations] = useState(new Set());

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    console.log('chatHistory state changed:', chatHistory);
    console.log('chatHistory length:', chatHistory.length);
    console.log('selectedApp:', selectedApp);
  }, [chatHistory, selectedApp]);

  const fetchApps = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/chat-history/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (appName) => {
    setLoadingHistory(true);
    try {
      console.log('Fetching chat history for app:', appName);
      const response = await fetch(`http://localhost:8001/api/v1/chat-history/app/${encodeURIComponent(appName)}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Raw data received:', data);
        console.log('Data type:', typeof data);
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');

        // Nhóm tin nhắn theo user_id
        const groupedByUser = data.reduce((groups, chat) => {
          console.log('Processing chat item:', chat);
          const userId = chat.user_id || 'unknown';
          console.log('User ID:', userId);

          if (!groups[userId]) {
            groups[userId] = {
              userId: userId,
              userInfo: chat.users || { full_name: `User ${userId}` },
              messages: [],
              latestTimestamp: chat.created_at || chat.timestamp
            };
            console.log('Created new group for user:', userId);
          }

          groups[userId].messages.push({
            id: chat.log_id || chat.id,
            user_message: chat.input_text,
            bot_response: chat.output_text,
            timestamp: chat.created_at || chat.timestamp
          });
          console.log('Added message to group:', userId);

          // Cập nhật timestamp mới nhất
          const currentTimestamp = chat.created_at || chat.timestamp;
          if (new Date(currentTimestamp) > new Date(groups[userId].latestTimestamp)) {
            groups[userId].latestTimestamp = currentTimestamp;
          }

          return groups;
        }, {});

        console.log('Grouped data:', groupedByUser);

        // Chuyển thành array và sắp xếp theo thời gian mới nhất
        const groupedData = Object.values(groupedByUser).sort((a, b) =>
          new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
        );

        console.log('Final grouped data:', groupedData);
        console.log('Number of conversations:', groupedData.length);

        setChatHistory(groupedData);
        console.log('Setting chatHistory state:', groupedData);
        setSelectedApp(appName);

        // Mặc định mở rộng cuộc hội thoại đầu tiên để hiển thị input/output
        if (groupedData.length > 0) {
          setExpandedConversations(new Set([groupedData[0].userId]));
          console.log('Expanded first conversation:', groupedData[0].userId);
        }
      } else {
        console.error('Failed to fetch chat history:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleConversation = (userId) => {
    const newExpanded = new Set(expandedConversations);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedConversations(newExpanded);
  };

  const expandAllConversations = () => {
    const allUserIds = new Set(chatHistory.map(conv => conv.userId));
    setExpandedConversations(allUserIds);
  };

  const collapseAllConversations = () => {
    setExpandedConversations(new Set());
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  if (loading) {
    return <div className="p-6">Đang tải danh sách ứng dụng...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lịch sử trò chuyện</h2>
        <button
          onClick={fetchApps}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Danh sách ứng dụng */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Danh sách ứng dụng</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {apps.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có ứng dụng nào
              </div>
            ) : (
              apps.map((app) => (
                <div
                  key={app.name}
                  onClick={() => fetchChatHistory(app.name)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedApp === app.name ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{app.name}</h4>
                      <p className="text-sm text-gray-500">{app.chat_count} cuộc trò chuyện</p>
                    </div>
                    <div className="text-gray-400">
                      💬
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lịch sử trò chuyện */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedApp ? `Lịch sử: ${selectedApp}` : 'Chọn một ứng dụng để xem lịch sử'}
              </h3>
              {chatHistory.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={expandAllConversations}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Mở rộng tất cả
                  </button>
                  <button
                    onClick={collapseAllConversations}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Thu gọn tất cả
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            {loadingHistory ? (
              <div className="text-center text-gray-500">
                Đang tải lịch sử trò chuyện...
              </div>
            ) : !selectedApp ? (
              <div className="text-center text-gray-500">
                Chọn một ứng dụng từ danh sách bên trái để xem lịch sử trò chuyện
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center text-gray-500">
                Chưa có cuộc trò chuyện nào cho ứng dụng này
              </div>
            ) : (
              <div className="space-y-6">
                {console.log('About to render chatHistory:', chatHistory)}
                {console.log('chatHistory is array:', Array.isArray(chatHistory))}
                {console.log('chatHistory length in render:', chatHistory.length)}
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  💡 <strong>Mẹo:</strong> Click vào header để mở rộng/thu gọn từng cuộc hội thoại. Sử dụng nút "Mở rộng tất cả" để xem tất cả input/output cùng lúc. Số hiển thị bên cạnh tên app là số lượng cuộc trò chuyện duy nhất đã diễn ra.
                </div>
                {chatHistory.map((conversation, convIndex) => {
                  console.log('Rendering conversation:', convIndex, conversation);
                  console.log('Conversation userId:', conversation.userId);
                  console.log('Conversation messages:', conversation.messages);
                  console.log('Conversation messages length:', conversation.messages ? conversation.messages.length : 'undefined');
                  
                  const isExpanded = expandedConversations.has(conversation.userId);
                  
                  return (
                    <div key={conversation.userId} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Header của cuộc hội thoại - Click để toggle */}
                      <div 
                        onClick={() => toggleConversation(conversation.userId)}
                        className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-blue-700">
                              {(conversation.userInfo.full_name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {conversation.userInfo.full_name || `User ${conversation.userId}`}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {(conversation.messages && conversation.messages.length) || 0} tin nhắn • Cuộc trò chuyện gần nhất: {formatTimestamp(conversation.latestTimestamp)}
                            </p>
                            {/* Preview tin nhắn đầu tiên */}
                            {conversation.messages && conversation.messages.length > 0 && conversation.messages[0] && (
                              <div className="mt-2 text-xs text-gray-600">
                                <div className="line-clamp-2 max-w-md">
                                  <span className="font-medium">User:</span> {conversation.messages[0].user_message ? conversation.messages[0].user_message : 'N/A'}
                                </div>
                                <div className="line-clamp-2 max-w-md mt-1">
                                  <span className="font-medium">Bot:</span> {conversation.messages[0].bot_response ? conversation.messages[0].bot_response : 'N/A'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="text-sm text-gray-500">ID: {conversation.userId}</span>
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Nội dung cuộc hội thoại - chỉ hiện khi expanded */}
                      {isExpanded && (
                        <div className="p-4 bg-white">
                          <div className="space-y-4">
                            {conversation.messages && conversation.messages.length > 0 ? (
                              conversation.messages
                                .sort((a, b) => {
                                  const timeA = a && a.timestamp ? new Date(a.timestamp) : new Date(0);
                                  const timeB = b && b.timestamp ? new Date(b.timestamp) : new Date(0);
                                  return timeA - timeB;
                                })
                                .map((message, msgIndex) => {
                                  console.log('Rendering message:', msgIndex, message);
                                  console.log('Message user_message:', message.user_message);
                                  console.log('Message bot_response:', message.bot_response);
                                  
                                return (
                                <div key={message && message.id || msgIndex} className="space-y-3">
                                  {/* Input của User - Bên phải */}
                                  <div className="flex justify-end">
                                    <div className="max-w-2xl w-full">
                                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">👤</span>
                                          </div>
                                          <span className="text-sm font-medium text-blue-700">User Input</span>
                                        </div>
                                        <div className="text-sm text-gray-900 bg-white p-3 rounded border whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                          {message && message.user_message ? message.user_message : 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          {formatTimestamp(message ? message.timestamp : null)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Output của Bot - Bên trái */}
                                  <div className="flex justify-start">
                                    <div className="max-w-2xl w-full">
                                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">🤖</span>
                                          </div>
                                          <span className="text-sm font-medium text-green-700">Bot Response</span>
                                        </div>
                                        <div className="text-sm text-gray-900 bg-white p-3 rounded border whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                          {message && message.bot_response ? message.bot_response : 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          {formatTimestamp(message ? message.timestamp : null)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )})
                            ) : (
                              <div className="text-center text-gray-500 py-4">
                                Không có tin nhắn nào trong cuộc hội thoại này
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {chatHistory.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Tổng cộng: {chatHistory.length} cuộc trò chuyện từ {new Set(chatHistory.flatMap(conv => conv.messages.map(msg => msg.user_id || conv.userId))).size} người dùng
        </div>
      )}
    </div>
  );
}


function UserChatHistoryManagement() {
  const [allUserChatHistory, setAllUserChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatflow, setSelectedChatflow] = useState('');
  const [chatflows, setChatflows] = useState([]);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationDetails, setConversationDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAllUserChatHistory();
    fetchChatflows();
  }, []);

  const fetchAllUserChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/v1/user-chat/admin/all-users');
      if (response.ok) {
        const data = await response.json();
        setAllUserChatHistory(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching all user chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatflows = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/chatflows/');
      if (response.ok) {
        const data = await response.json();
        setChatflows(data);
      }
    } catch (error) {
      console.error('Error fetching chatflows:', error);
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const fetchConversationDetails = async (conversationId) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/chat-history/conversation/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversationDetails(data);
        setSelectedConversation(conversationId);
        setShowDetailsModal(true);
      } else {
        console.error('Failed to fetch conversation details');
        alert('Không thể tải chi tiết cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      alert('Lỗi kết nối khi tải chi tiết cuộc trò chuyện');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedConversation(null);
    setConversationDetails([]);
  };

  const filteredUsers = allUserChatHistory.filter(userData => {
    const user = userData.user || {};
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChatflow = !selectedChatflow || 
      userData.conversations?.some(conversation => conversation.app_id == selectedChatflow);
    
    return matchesSearch && matchesChatflow;
  });

  if (loading) {
    return <div className="p-6">Đang tải lịch sử chat của tất cả users...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lịch sử Chat của tất cả Users</h2>
        <button
          onClick={fetchAllUserChatHistory}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm User</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo Chatbot</label>
            <select
              value={selectedChatflow}
              onChange={(e) => setSelectedChatflow(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả chatbot</option>
              {chatflows.map((chatflow) => (
                <option key={chatflow.id} value={chatflow.id}>
                  {chatflow.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedChatflow('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Users Chat History */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch sử chat</h3>
            <p className="text-gray-600">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
          </div>
        ) : (
          filteredUsers.map((userData) => {
            const user = userData.user || {};
            const conversations = userData.conversations || [];
            const isExpanded = expandedUsers.has(user.id);
            
            return (
              <div key={user.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* User Header */}
                <div 
                  onClick={() => toggleUserExpansion(user.id)}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {(user.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.full_name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {user.email} • {conversations.length} cuộc trò chuyện
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Lần truy cập cuối: {conversations.length > 0 ? new Date(Math.max(...conversations.map(c => new Date(c.created_at || 0)))).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* User Conversations */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Không có lịch sử chat cho user này
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {conversations.map((conversation, index) => {
                          return (
                            <div key={index} className="p-4 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {conversation.name_app || 'Unknown Chatbot'}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Conversation ID: {conversation.conversation_id ? conversation.conversation_id.substring(0, 8) + '...' : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-gray-900">
                                    {conversation.created_at ? new Date(conversation.created_at).toLocaleString('vi-VN') : 'N/A'}
                                  </p>
                                  <button
                                    onClick={() => fetchConversationDetails(conversation.conversation_id)}
                                    disabled={loadingDetails}
                                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                                    title="Xem chi tiết cuộc trò chuyện"
                                  >
                                    {loadingDetails ? '⏳' : '👁️ Chi tiết'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng cộng: {filteredUsers.length} users • {filteredUsers.reduce((sum, user) => sum + (user.conversations?.length || 0), 0)} cuộc trò chuyện
        </div>
      )}

      {/* Conversation Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Chi tiết cuộc trò chuyện</h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Conversation ID: {selectedConversation}
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải chi tiết...</p>
                </div>
              ) : conversationDetails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có tin nhắn nào trong cuộc trò chuyện này
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationDetails
                    .sort((a, b) => new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp))
                    .map((message, index) => (
                      <div key={message.log_id || message.id || index} className="space-y-3">
                        {/* User Input */}
                        <div className="flex justify-end">
                          <div className="max-w-2xl w-full">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">👤</span>
                                </div>
                                <span className="text-sm font-medium text-blue-700">User Input</span>
                              </div>
                              <div className="text-sm text-gray-900 bg-white p-3 rounded border whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                {message.input_text || message.user_message || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {message.created_at ? new Date(message.created_at).toLocaleString('vi-VN') : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bot Response */}
                        <div className="flex justify-start">
                          <div className="max-w-2xl w-full">
                            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">🤖</span>
                                </div>
                                <span className="text-sm font-medium text-green-700">Bot Response</span>
                              </div>
                              <div className="text-sm text-gray-900 bg-white p-3 rounded border whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                {message.output_text || message.bot_response || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {message.created_at ? new Date(message.created_at).toLocaleString('vi-VN') : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletingDepartment, setDeletingDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [editDepartment, setEditDepartment] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/departments/');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8001/api/v1/departments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDepartment)
      });
      if (response.ok) {
        setShowAddForm(false);
        setNewDepartment({ name: '', description: '' });
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8001/api/v1/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editDepartment)
      });
      if (response.ok) {
        setShowEditForm(false);
        setEditingDepartment(null);
        setEditDepartment({ name: '', description: '' });
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      return;
    }

    setDeletingDepartment(departmentId);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/departments/${departmentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchDepartments();
        alert('Đã xóa phòng ban thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa phòng ban!');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Có lỗi xảy ra khi xóa phòng ban!');
    } finally {
      setDeletingDepartment(null);
    }
  };

  const openEditForm = (department) => {
    setEditingDepartment(department);
    setEditDepartment({ name: department.name, description: department.description || '' });
    setShowEditForm(true);
  };

  if (loading) {
    return <div className="p-6">Đang tải danh sách phòng ban...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Quản lý Phòng ban</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
        >
          Thêm Phòng ban
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Thêm Phòng ban Mới</h3>
          <form onSubmit={handleAddDepartment}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Tên phòng ban</label>
              <input
                type="text"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Thêm
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h3 className="text-lg font-semibold mb-2">Sửa Phòng ban</h3>
          <form onSubmit={handleEditDepartment}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Tên phòng ban</label>
              <input
                type="text"
                value={editDepartment.name}
                onChange={(e) => setEditDepartment({...editDepartment, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                value={editDepartment.description}
                onChange={(e) => setEditDepartment({...editDepartment, description: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows="3"
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Cập nhật
              </button>
              <button type="button" onClick={() => {setShowEditForm(false); setEditingDepartment(null);}} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tên phòng ban
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Mô tả</span>
                  <span className="sm:hidden">Mô tả</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Thời gian tạo</span>
                  <span className="sm:hidden">Ngày tạo</span>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <span className="hidden sm:inline">Thao tác</span>
                  <span className="sm:hidden">...</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {department.name}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {department.description || 'Không có mô tả'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="hidden sm:inline">{new Date(department.created_at).toLocaleString('vi-VN')}</span>
                    <span className="sm:hidden">{new Date(department.created_at).toLocaleDateString('vi-VN')}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-3">
                      <button 
                        onClick={() => openEditForm(department)}
                        className="px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Sửa phòng ban"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteDepartment(department.id)}
                        disabled={deletingDepartment === department.id}
                        className="px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Xóa phòng ban"
                      >
                        {deletingDepartment === department.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [deletingNotification, setDeletingNotification] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    type: 'info', // 'info', 'warning', 'error', 'success', 'announcement'
    priority: 'normal', // 'low', 'normal', 'high', 'urgent'
    status: 'draft',
    recipient_emails: [],
    recipient_employees: [],
    recipient_departments: [],
    recipient_roles: [],
    send_to_all: false,
    scheduled_send_at: ''
  });
  const [editNotification, setEditNotification] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'normal',
    status: 'draft',
    recipient_emails: [],
    recipient_employees: [],
    recipient_departments: [],
    recipient_roles: [],
    send_to_all: false,
    scheduled_send_at: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/notifications/');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/users/');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/departments/');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleAddNotification = async (e) => {
    e.preventDefault();
    try {
      // Filter out null values from selectedEmployees
      const filteredEmployees = selectedEmployees.filter(emp => emp != null && emp !== '');

      const notificationData = {
        ...newNotification,
        recipient_employees: filteredEmployees
      };

      const response = await fetch('http://localhost:8001/api/v1/notifications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewNotification({
          title: '',
          content: '',
          type: 'info',
          priority: 'normal',
          status: 'draft',
          recipient_emails: [],
          recipient_employees: [],
          recipient_departments: [],
          recipient_roles: [],
          send_to_all: false,
          scheduled_send_at: ''
        });
        setSelectedEmployees([]);
        fetchNotifications();
        alert('Đã tạo thông báo thành công!');
      } else {
        const errorData = await response.json();
        alert('Lỗi tạo thông báo: ' + (errorData.detail || 'Có lỗi xảy ra'));
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      alert('Lỗi kết nối đến server: ' + error.message);
    }
  };

  const handleEditNotification = async (e) => {
    e.preventDefault();
    try {
      // Filter out null values from selectedEmployees
      const filteredEmployees = selectedEmployees.filter(emp => emp != null && emp !== '');

      const notificationData = {
        ...editNotification,
        recipient_employees: filteredEmployees
      };

      const response = await fetch(`http://localhost:8001/api/v1/notifications/${editingNotification.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        setShowEditForm(false);
        setEditingNotification(null);
        setEditNotification({
          title: '',
          content: '',
          type: 'info',
          priority: 'normal',
          status: 'draft',
          recipient_emails: [],
          recipient_employees: [],
          recipient_departments: [],
          recipient_roles: [],
          send_to_all: false,
          scheduled_send_at: ''
        });
        setSelectedEmployees([]);
        fetchNotifications();
        alert('Đã cập nhật thông báo thành công!');
      } else {
        const errorData = await response.json();
        alert('Lỗi cập nhật thông báo: ' + (errorData.detail || 'Có lỗi xảy ra'));
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      alert('Lỗi kết nối đến server: ' + error.message);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }

    setDeletingNotification(notificationId);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchNotifications();
        alert('Đã xóa thông báo thành công!');
      } else {
        alert('Có lỗi xảy ra khi xóa thông báo!');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Có lỗi xảy ra khi xóa thông báo!');
    } finally {
      setDeletingNotification(null);
    }
  };

  const handleSendNotification = async (notificationId) => {
    if (!confirm('Bạn có chắc chắn muốn gửi thông báo này ngay bây giờ?')) {
      return;
    }

    setSendingNotification(notificationId);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/notifications/${notificationId}/send`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchNotifications();
        alert('Đã gửi thông báo thành công!');
      } else {
        const errorData = await response.json();
        alert('Lỗi gửi thông báo: ' + (errorData.detail || 'Có lỗi xảy ra'));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Lỗi kết nối đến server: ' + error.message);
    } finally {
      setSendingNotification(null);
    }
  };

  const openEditForm = (notification) => {
    setEditingNotification(notification);
    setEditNotification({
      title: notification.title,
      content: notification.content,
      type: notification.type || 'info',
      priority: notification.priority || 'normal',
      status: notification.status || 'draft',
      recipient_emails: notification.recipient_emails || [],
      recipient_employees: notification.recipient_employees || [],
      recipient_departments: notification.recipient_departments || [],
      recipient_roles: notification.recipient_roles || [],
      send_to_all: notification.send_to_all || false,
      scheduled_send_at: notification.scheduled_send_at ? notification.scheduled_send_at.substring(0, 16) : ''
    });
    setSelectedEmployees(notification.recipient_employees || []);
    setShowEditForm(true);
  };

  const handleEmployeeSelection = (employeeId) => {
    // If selecting 1 employee, select all employees instead
    const filteredEmployees = getFilteredEmployees();
    const allIds = filteredEmployees.map(emp => emp.id);
    setSelectedEmployees(allIds);
  };

  const handleSelectAllEmployees = () => {
    const filteredEmployees = getFilteredEmployees();
    const allIds = filteredEmployees.map(emp => emp.id);
    setSelectedEmployees(prev => {
      const newSelection = [...prev];
      allIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  const handleDeselectAllEmployees = () => {
    const filteredEmployees = getFilteredEmployees();
    const filteredIds = filteredEmployees.map(emp => emp.id);
    setSelectedEmployees(prev => prev.filter(id => !filteredIds.includes(id)));
  };

  const getFilteredEmployees = () => {
    return employees.filter(employee => {
      const matchesSearch = employeeSearchTerm === '' ||
        employee.full_name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        (employee.ma_nv && employee.ma_nv.toLowerCase().includes(employeeSearchTerm.toLowerCase()));

      const matchesDepartment = selectedDepartmentFilter === '' ||
        employee.department_id?.toString() === selectedDepartmentFilter;

      return matchesSearch && matchesDepartment;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'announcement': return '📢';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Thông báo</h1>
            <p className="text-gray-600">Tạo và quản lý thông báo cho nhân viên</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo Thông báo Mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng thông báo</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V12a7 7 0 00-14 0v5h5m0 0v1a3 3 0 006 0v-1m-6 0H9" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã gửi</p>
                <p className="text-2xl font-bold text-green-600">{notifications.filter(n => n.status === 'sent').length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa gửi</p>
                <p className="text-2xl font-bold text-yellow-600">{notifications.filter(n => n.status === 'draft').length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lên lịch</p>
                <p className="text-2xl font-bold text-purple-600">{notifications.filter(n => n.status === 'scheduled').length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Notification Form - Inline */}
      {showAddForm && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Tạo Thông báo Mới</h3>
                  <p className="text-blue-100 mt-1">Tạo thông báo để gửi đến nhân viên</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedEmployees([]);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddNotification} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề thông báo</label>
                      <input
                        type="text"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Nhập tiêu đề thông báo..."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung thông báo</label>
                      <textarea
                        value={newNotification.content}
                        onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        rows="4"
                        placeholder="Nhập nội dung thông báo..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</label>
                      <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="info">ℹ️ Thông tin</option>
                        <option value="warning">⚠️ Cảnh báo</option>
                        <option value="error">❌ Lỗi</option>
                        <option value="success">✅ Thành công</option>
                        <option value="announcement">📢 Thông báo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Độ ưu tiên</label>
                      <select
                        value={newNotification.priority}
                        onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="low">🟢 Thấp</option>
                        <option value="normal">🔵 Bình thường</option>
                        <option value="high">🟠 Cao</option>
                        <option value="urgent">🔴 Khẩn cấp</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Người nhận
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={newNotification.send_to_all}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewNotification({
                            ...newNotification,
                            send_to_all: checked,
                            recipient_emails: checked ? [] : newNotification.recipient_emails,
                            recipient_employees: checked ? [] : newNotification.recipient_employees,
                            recipient_departments: checked ? [] : newNotification.recipient_departments,
                            recipient_roles: checked ? [] : newNotification.recipient_roles
                          });
                        }}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="text-sm font-medium text-gray-700">Gửi cho tất cả nhân viên</label>
                        <p className="text-xs text-gray-500">Thông báo sẽ được gửi đến toàn bộ nhân viên trong công ty</p>
                      </div>
                    </div>

                    {!newNotification.send_to_all && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Chọn nhân viên cụ thể</label>

                          {/* Inline Employee Selector */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            {/* Search and Filter */}
                            <div className="mb-4 space-y-3">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm nhân viên</label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={employeeSearchTerm}
                                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                      placeholder="Tìm theo tên, email hoặc mã nhân viên..."
                                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 text-sm text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="sm:w-48">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Lọc theo phòng ban</label>
                                  <select
                                    value={selectedDepartmentFilter}
                                    onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  >
                                    <option value="">Tất cả phòng ban</option>
                                    {departments.map((dept) => (
                                      <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Bulk Actions */}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={handleSelectAllEmployees}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                                >
                                  Chọn tất cả ({getFilteredEmployees().length})
                                </button>
                                <button
                                  onClick={handleDeselectAllEmployees}
                                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                                >
                                  Bỏ chọn tất cả
                                </button>
                                <div className="ml-auto text-xs text-gray-600 flex items-center gap-2">
                                  <span>Đã chọn: {selectedEmployees.length} nhân viên</span>
                                </div>
                              </div>
                            </div>

                            {/* Employee List */}
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md bg-white">
                              {getFilteredEmployees().length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <p className="text-sm font-medium">Không tìm thấy nhân viên</p>
                                  <p className="text-xs">Thử tìm kiếm với từ khóa khác</p>
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-100">
                                  {getFilteredEmployees().map((employee) => (
                                    <div
                                      key={employee.id}
                                      className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                        selectedEmployees.includes(employee.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                      }`}
                                      onClick={() => handleEmployeeSelection(employee.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            selectedEmployees.includes(employee.id)
                                              ? 'bg-blue-600 border-blue-600'
                                              : 'border-gray-300 hover:border-blue-400'
                                          }`}>
                                            {selectedEmployees.includes(employee.id) && (
                                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </div>
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                              {employee.full_name.charAt(0).toUpperCase()}
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {employee.full_name}
                                              </p>
                                              {employee.ma_nv && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                  {employee.ma_nv}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <span className="text-xs text-gray-500">
                                                {departments.find(d => d.id === employee.department_id)?.name || 'Chưa phân công'}
                                              </span>
                                              {employee.chuc_vu && (
                                                <>
                                                  <span className="text-gray-300">•</span>
                                                  <span className="text-xs text-gray-500">{employee.chuc_vu}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {selectedEmployees.includes(employee.id) && (
                                          <div className="flex-shrink-0">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              ✓ Đã chọn
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-600">
                                Hiển thị {getFilteredEmployees().length} nhân viên
                                {employeeSearchTerm && ` cho "${employeeSearchTerm}"`}
                                {selectedDepartmentFilter && ` trong ${departments.find(d => d.id.toString() === selectedDepartmentFilter)?.name}`}
                              </div>
                              <button
                                onClick={() => {
                                  setEmployeeSearchTerm('');
                                  setSelectedDepartmentFilter('');
                                }}
                                className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Xóa bộ lọc
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Email recipients */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email người nhận bổ sung</label>
                          <input
                            type="text"
                            value={newNotification.recipient_emails?.join(', ') || ''}
                            onChange={(e) => {
                              const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email);
                              setNewNotification({...newNotification, recipient_emails: emails});
                            }}
                            className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="email1@example.com, email2@example.com"
                          />
                          <p className="text-xs text-gray-500 mt-1">Các email bổ sung ngoài danh sách nhân viên đã chọn</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lịch gửi
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian gửi</label>
                    <input
                      type="datetime-local"
                      value={newNotification.scheduled_send_at}
                      onChange={(e) => setNewNotification({...newNotification, scheduled_send_at: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống để gửi ngay lập tức sau khi tạo</p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedEmployees([]);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Tạo Thông báo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Form - Inline */}
      {showEditForm && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Chỉnh sửa Thông báo</h3>
                  <p className="text-green-100 mt-1">Cập nhật thông tin thông báo</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingNotification(null);
                    setSelectedEmployees([]);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleEditNotification} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề thông báo</label>
                      <input
                        type="text"
                        value={editNotification.title}
                        onChange={(e) => setEditNotification({...editNotification, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Nhập tiêu đề thông báo..."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung thông báo</label>
                      <textarea
                        value={editNotification.content}
                        onChange={(e) => setEditNotification({...editNotification, content: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        rows="4"
                        placeholder="Nhập nội dung thông báo..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</label>
                      <select
                        value={editNotification.type}
                        onChange={(e) => setEditNotification({...editNotification, type: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="info">ℹ️ Thông tin</option>
                        <option value="warning">⚠️ Cảnh báo</option>
                        <option value="error">❌ Lỗi</option>
                        <option value="success">✅ Thành công</option>
                        <option value="announcement">📢 Thông báo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Độ ưu tiên</label>
                      <select
                        value={editNotification.priority}
                        onChange={(e) => setEditNotification({...editNotification, priority: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="low">🟢 Thấp</option>
                        <option value="normal">🔵 Bình thường</option>
                        <option value="high">🟠 Cao</option>
                        <option value="urgent">🔴 Khẩn cấp</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recipients */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Người nhận
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={editNotification.send_to_all}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditNotification({
                            ...editNotification,
                            send_to_all: checked,
                            recipient_emails: checked ? [] : editNotification.recipient_emails,
                            recipient_employees: checked ? [] : editNotification.recipient_employees,
                            recipient_departments: checked ? [] : editNotification.recipient_departments,
                            recipient_roles: checked ? [] : editNotification.recipient_roles
                          });
                        }}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label className="text-sm font-medium text-gray-700">Gửi cho tất cả nhân viên</label>
                        <p className="text-xs text-gray-500">Thông báo sẽ được gửi đến toàn bộ nhân viên trong công ty</p>
                      </div>
                    </div>

                    {!editNotification.send_to_all && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Chọn nhân viên cụ thể</label>

                          {/* Inline Employee Selector */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            {/* Search and Filter */}
                            <div className="mb-4 space-y-3">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tìm kiếm nhân viên</label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={employeeSearchTerm}
                                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                      placeholder="Tìm theo tên, email hoặc mã nhân viên..."
                                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 text-sm text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="sm:w-48">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Lọc theo phòng ban</label>
                                  <select
                                    value={selectedDepartmentFilter}
                                    onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  >
                                    <option value="">Tất cả phòng ban</option>
                                    {departments.map((dept) => (
                                      <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Bulk Actions */}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={handleSelectAllEmployees}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                                >
                                  Chọn tất cả ({getFilteredEmployees().length})
                                </button>
                                <button
                                  onClick={handleDeselectAllEmployees}
                                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                                >
                                  Bỏ chọn tất cả
                                </button>
                                <div className="ml-auto text-xs text-gray-600 flex items-center gap-2">
                                  <span>Đã chọn: {selectedEmployees.length} nhân viên</span>
                                </div>
                              </div>
                            </div>

                            {/* Employee List */}
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md bg-white">
                              {getFilteredEmployees().length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <p className="text-sm font-medium">Không tìm thấy nhân viên</p>
                                  <p className="text-xs">Thử tìm kiếm với từ khóa khác</p>
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-100">
                                  {getFilteredEmployees().map((employee) => (
                                    <div
                                      key={employee.id}
                                      className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                        selectedEmployees.includes(employee.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                      }`}
                                      onClick={() => handleEmployeeSelection(employee.id)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            selectedEmployees.includes(employee.id)
                                              ? 'bg-blue-600 border-blue-600'
                                              : 'border-gray-300 hover:border-blue-400'
                                          }`}>
                                            {selectedEmployees.includes(employee.id) && (
                                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </div>
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                              {employee.full_name.charAt(0).toUpperCase()}
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {employee.full_name}
                                              </p>
                                              {employee.ma_nv && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                  {employee.ma_nv}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <span className="text-xs text-gray-500">
                                                {departments.find(d => d.id === employee.department_id)?.name || 'Chưa phân công'}
                                              </span>
                                              {employee.chuc_vu && (
                                                <>
                                                  <span className="text-gray-300">•</span>
                                                  <span className="text-xs text-gray-500">{employee.chuc_vu}</span>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {selectedEmployees.includes(employee.id) && (
                                          <div className="flex-shrink-0">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              ✓ Đã chọn
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-600">
                                Hiển thị {getFilteredEmployees().length} nhân viên
                                {employeeSearchTerm && ` cho "${employeeSearchTerm}"`}
                                {selectedDepartmentFilter && ` trong ${departments.find(d => d.id.toString() === selectedDepartmentFilter)?.name}`}
                              </div>
                              <button
                                onClick={() => {
                                  setEmployeeSearchTerm('');
                                  setSelectedDepartmentFilter('');
                                }}
                                className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                Xóa bộ lọc
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Email recipients */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email người nhận bổ sung</label>
                          <input
                            type="text"
                            value={editNotification.recipient_emails?.join(', ') || ''}
                            onChange={(e) => {
                              const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email);
                              setEditNotification({...editNotification, recipient_emails: emails});
                            }}
                            className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="email1@example.com, email2@example.com"
                          />
                          <p className="text-xs text-gray-500 mt-1">Các email bổ sung ngoài danh sách nhân viên đã chọn</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lịch gửi
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian gửi</label>
                    <input
                      type="datetime-local"
                      value={editNotification.scheduled_send_at}
                      onChange={(e) => setEditNotification({...editNotification, scheduled_send_at: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg shadow-sm p-4 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống để gửi ngay lập tức sau khi tạo</p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingNotification(null);
                      setSelectedEmployees([]);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Cập nhật Thông báo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách thông báo</h3>
            <p className="text-sm text-gray-600 mt-1">Quản lý tất cả thông báo đã tạo</p>
          </div>

          <div className="overflow-x-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V12a7 7 0 00-14 0v5h5m0 0v1a3 3 0 006 0v-1m-6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thông báo nào</h3>
                <p className="text-gray-600 mb-6">Tạo thông báo đầu tiên để bắt đầu giao tiếp với nhân viên</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  Tạo thông báo đầu tiên
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thông báo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Loại & Ưu tiên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Lịch gửi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2 max-w-md">
                              {notification.content}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {notification.type === 'info' ? 'Thông tin' :
                             notification.type === 'warning' ? 'Cảnh báo' :
                             notification.type === 'error' ? 'Lỗi' :
                             notification.type === 'success' ? 'Thành công' :
                             notification.type === 'announcement' ? 'Thông báo' : notification.type}
                          </span>
                          <br />
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority === 'low' ? 'Thấp' :
                             notification.priority === 'normal' ? 'Bình thường' :
                             notification.priority === 'high' ? 'Cao' :
                             notification.priority === 'urgent' ? 'Khẩn cấp' : notification.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                          {notification.status === 'draft' ? '📝 Nháp' :
                           notification.status === 'scheduled' ? '⏰ Đã lên lịch' :
                           notification.status === 'sent' ? '✅ Đã gửi' :
                           notification.status === 'failed' ? '❌ Thất bại' : notification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.scheduled_send_at
                          ? new Date(notification.scheduled_send_at).toLocaleString('vi-VN')
                          : '📤 Gửi ngay'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {notification.status === 'draft' && (
                            <button
                              onClick={() => handleSendNotification(notification.id)}
                              disabled={sendingNotification === notification.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                              title="Gửi ngay"
                            >
                              {sendingNotification === notification.id ? (
                                <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              )}
                              Gửi
                            </button>
                          )}
                          <button
                            onClick={() => openEditForm(notification)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={deletingNotification === notification.id}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                            title="Xóa"
                          >
                            {deletingNotification === notification.id ? (
                              <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


