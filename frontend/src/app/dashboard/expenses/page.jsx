'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit, Trash2, TrendingDown, DollarSign, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings, RotateCcw, Save, RefreshCw, Download, Users, Wrench, Eye, EyeOff, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { uploadExpenseImage, deleteExpenseImage, testSupabaseStorage, testSupabaseConnection, testNetworkConnectivity, listAllBuckets, createExpenseFolder, testUploadWithPolicies } from '../../../lib/supabaseStorage';

const supabase = createClientComponentClient();

function ExpensesLayout({ user, activeTab, onTabChange, children }) {
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'expenses', label: 'Chi phí', icon: Receipt },
    { id: 'categories', label: 'Loại chi phí', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Chi phí</h1>
              <p className="text-gray-600 mt-1">Quản lý và theo dõi các khoản chi phí</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email || user?.username || 'User'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
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
                      ? 'border-red-500 text-red-600'
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

function ExpensesOverviewTab({ expenses, expenseCategories, selectedMonth }) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.giathanh || 0), 0);
  const expenseCount = expenses.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Số khoản chi phí</p>
              <p className="text-2xl font-bold text-gray-900">{expenseCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trung bình/khoản</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenseCount > 0 ? (totalExpenses / expenseCount).toLocaleString('vi-VN') : 0} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loại chi phí</p>
              <p className="text-2xl font-bold text-gray-900">{expenseCategories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense by Category */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi phí theo loại</h3>
        <div className="space-y-4">
          {Object.entries(
            expenses.reduce((acc, expense) => {
              const categoryName = expense.loaichiphi?.tenchiphi || 'Chưa phân loại';
              const expenseType = 'Chi phí'; // Simplified since loaichiphi is not available
              const key = `${categoryName} (${expenseType})`;
              acc[key] = (acc[key] || 0) + (expense.giathanh || 0);
              return acc;
            }, {})
          ).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Receipt className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium text-gray-900">{category}</span>
              </div>
              <span className="font-bold text-red-600">{amount.toLocaleString('vi-VN')} VND</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ chi phí theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ month: selectedMonth, expenses: totalExpenses }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), 'Chi phí']} />
            <Bar dataKey="expenses" fill="#EF4444" name="Chi phí" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ExpensesManagementTab({ expenses, expenseCategories, selectedMonth, onExpenseUpdate }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    id_lcp: '',
    giathanh: '',
    mo_ta: '',
    hinhanh: '',
    created_at: new Date().toISOString().split('T')[0] // Default to today
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setExpenseForm({...expenseForm, hinhanh: ''});
    setUploadStatus(null);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate required fields
    if (!expenseForm.id_lcp || expenseForm.id_lcp === '') {
      setError('Vui lòng chọn loại chi phí');
      setLoading(false);
      return;
    }

    if (!expenseForm.giathanh || expenseForm.giathanh === '') {
      setError('Vui lòng nhập số tiền');
      setLoading(false);
      return;
    }

    if (!expenseForm.created_at || expenseForm.created_at === '') {
      setError('Vui lòng chọn ngày chi phí');
      setLoading(false);
      return;
    }

    let imageUrl = '';

    // Upload image if selected
    if (selectedFile) {
      setUploadingImage(true);
      try {
        const uploadResult = await uploadExpenseImage(selectedFile);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          setError(uploadResult.error);
          setLoading(false);
          setUploadingImage(false);
          return;
        }
      } catch (error) {
        console.error('Upload error:', error);
        setError('Không thể upload hình ảnh. Vui lòng thử lại.');
        setLoading(false);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense
        ? `http://localhost:8001/api/v1/quanly_chiphi/${editingExpense.id}`
        : 'http://localhost:8001/api/v1/quanly_chiphi/';

      // Prepare the data to send
      const dataToSend = {
        id_lcp: expenseForm.id_lcp ? parseInt(expenseForm.id_lcp) : null,
        giathanh: parseFloat(expenseForm.giathanh) || null,
        mo_ta: expenseForm.mo_ta || null,
        hinhanh: imageUrl || expenseForm.hinhanh || null,
        created_at: expenseForm.created_at ? new Date(expenseForm.created_at).toISOString() : new Date().toISOString()
      };

      console.log('Sending data:', dataToSend); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setSuccess(true);
        setExpenseForm({
          id_lcp: '',
          giathanh: '',
          mo_ta: '',
          hinhanh: '',
          created_at: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setPreviewUrl('');
        setEditingExpense(null);
        onExpenseUpdate();

        // Đóng modal sau 2 giây
        setTimeout(() => {
          setShowExpenseForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData); // Debug log
        setError(errorData.detail || 'Có lỗi xảy ra khi lưu chi phí');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Có lỗi xảy ra khi lưu chi phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/quanly_chiphi/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
        onExpenseUpdate();

        // Ẩn thông báo sau 2 giây
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError('Có lỗi xảy ra khi xóa chi phí');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Có lỗi xảy ra khi xóa chi phí');
    }
  };

  const editExpense = (expense) => {
    // Tìm category tương ứng để áp dụng auto-fill logic
    const selectedCategory = expenseCategories.find(cat => cat.id.toString() === expense.id_lcp);
    
    let autoFillGiathanh = expense.giathanh ? expense.giathanh.toString() : '';
    // Nếu là định phí và category có giá thành, thì dùng giá thành của category
    if (selectedCategory && selectedCategory.loaichiphi === 'định phí' && selectedCategory.giathanh) {
      autoFillGiathanh = selectedCategory.giathanh.toString();
    }
    
    setEditingExpense(expense);
    setExpenseForm({
      id_lcp: expense.id_lcp || '',
      giathanh: autoFillGiathanh,
      mo_ta: expense.mo_ta || '',
      hinhanh: expense.hinhanh || '',
      created_at: expense.created_at ? new Date(expense.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setError('');
    setSuccess(false);
    setShowExpenseForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách chi phí tháng {selectedMonth}</h2>
          <p className="text-gray-600 mt-1">Quản lý chi phí theo tháng</p>
        </div>
        <button
          onClick={() => {
            setShowExpenseForm(true);
            setEditingExpense(null);
            setExpenseForm({
              id_lcp: '',
              giathanh: '',
              mo_ta: '',
              hinhanh: '',
              created_at: new Date().toISOString().split('T')[0]
            });
            setSelectedFile(null);
            setPreviewUrl('');
            setError('');
            setSuccess(false);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chi phí</span>
        </button>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingExpense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}
                </h3>
                <p className="text-red-700 mt-1">Thêm khoản chi phí cho doanh nghiệp của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpenseForm(false)}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
              title="Đóng"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">
                {editingExpense ? 'Cập nhật chi phí thành công!' : 'Thêm chi phí thành công!'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleExpenseSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Selection Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-blue-600">🏷️</span>
                  </span>
                  Loại chi phí
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={expenseForm.id_lcp}
                    onChange={(e) => {
                      const selectedCategoryId = e.target.value;
                      const selectedCategory = expenseCategories.find(cat => cat.id.toString() === selectedCategoryId);
                      
                      let newGiathanh = expenseForm.giathanh;
                      if (selectedCategory && selectedCategory.loaichiphi === 'định phí' && selectedCategory.giathanh) {
                        newGiathanh = selectedCategory.giathanh.toString();
                      } else if (selectedCategory && selectedCategory.loaichiphi === 'biến phí') {
                        newGiathanh = '';
                      }
                      
                      setExpenseForm({...expenseForm, id_lcp: selectedCategoryId, giathanh: newGiathanh});
                    }}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
                    required
                  >
                    <option value="">Chọn loại chi phí...</option>
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>
                        {cat.tenchiphi}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Chọn loại chi phí từ danh sách có sẵn
                </p>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-green-600">�</span>
                  </span>
                  Số tiền (VND)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={expenseForm.giathanh ? Number(expenseForm.giathanh).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[.,\s]/g, '');
                      if (!isNaN(value) && value !== '') {
                        setExpenseForm({...expenseForm, giathanh: parseFloat(value)});
                      } else if (value === '') {
                        setExpenseForm({...expenseForm, giathanh: ''});
                      }
                    }}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="0"
                    required
                  />
                  <div className="absolute right-4 top-4 text-gray-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Nhập số tiền chính xác (ví dụ: 1.000.000)
                </p>
              </div>

              {/* Date Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-orange-600">📅</span>
                  </span>
                  Ngày chi phí
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expenseForm.created_at}
                    onChange={(e) => setExpenseForm({...expenseForm, created_at: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
                    required
                  />
                  <div className="absolute right-4 top-4 text-gray-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Chọn ngày thực hiện chi phí
                </p>
              </div>

              {/* Image Upload Field */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-yellow-600">�</span>
                  </span>
                  Hình ảnh
                  <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                </label>
                <div className="space-y-4">
                  {/* File Input */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="w-full flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-100 transition-colors duration-200">
                          <svg className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors duration-200">
                          {selectedFile ? selectedFile.name : 'Chọn hình ảnh từ máy tính'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG tối đa 5MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        title="Xóa hình ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Upload Status */}
                  {uploadStatus && (
                    <div className={`text-sm ${uploadStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {uploadStatus.message}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Nhập URL hình ảnh để minh họa cho khoản chi phí
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-semibold hover:shadow-md text-lg"
              >
                <div className="flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  Hủy
                </div>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    {editingExpense ? 'Cập nhật chi phí' : 'Thêm chi phí'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có chi phí nào trong tháng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại chi phí</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {expense.loaichiphi?.tenchiphi || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.mo_ta || 'Không có mô tả'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {(expense.giathanh || 0).toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Chi tiết chi phí</h3>
                    <p className="text-blue-700 mt-1">Thông tin chi tiết về khoản chi phí</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExpense(null)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200"
                  title="Đóng"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expense Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-gray-600" />
                      Thông tin chi phí
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Loại chi phí:</span>
                        <span className="font-medium text-gray-900">
                          {selectedExpense.loaichiphi?.tenchiphi || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Loại:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedExpense.loaichiphi?.loaichiphi === 'định phí' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedExpense.loaichiphi?.loaichiphi || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-bold text-red-600 text-lg">
                          {(selectedExpense.giathanh || 0).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ngày chi phí:</span>
                        <span className="font-medium text-gray-900">
                          {selectedExpense.created_at ? new Date(selectedExpense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Mô tả:</span>
                        <span className="font-medium text-gray-900 text-right max-w-xs">
                          {selectedExpense.mo_ta || 'Không có mô tả'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Price Info */}
                  {selectedExpense.loaichiphi?.loaichiphi === 'định phí' && selectedExpense.loaichiphi?.giathanh && (
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Thông tin giá thành
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Giá thành định phí:</span>
                          <span className="font-bold text-blue-900">
                            {Number(selectedExpense.loaichiphi.giathanh).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Chi phí thực tế:</span>
                          <span className="font-bold text-blue-900">
                            {(selectedExpense.giathanh || 0).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                          <span className="text-blue-700 font-medium">Chênh lệch:</span>
                          <span className={`font-bold ${
                            (selectedExpense.giathanh || 0) > (selectedExpense.loaichiphi.giathanh || 0) 
                              ? 'text-red-600' 
                              : (selectedExpense.giathanh || 0) < (selectedExpense.loaichiphi.giathanh || 0)
                                ? 'text-green-600'
                                : 'text-gray-600'
                          }`}>
                            {((selectedExpense.giathanh || 0) - (selectedExpense.loaichiphi.giathanh || 0)).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Display */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      Hình ảnh minh họa
                    </h4>
                    
                    {selectedExpense.hinhanh ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={selectedExpense.hinhanh}
                            alt="Expense proof"
                            className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-sm"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                              e.target.alt = 'Không thể tải hình ảnh';
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Hình ảnh từ storage</span>
                          <a
                            href={selectedExpense.hinhanh}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Xem ảnh gốc
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Không có hình ảnh minh họa</p>
                        <p className="text-sm text-gray-400 mt-1">Chi phí này chưa được đính kèm hình ảnh</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        editExpense(selectedExpense);
                        setSelectedExpense(null);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold"
                    >
                      <div className="flex items-center justify-center">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedExpense(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                    >
                      <div className="flex items-center justify-center">
                        <X className="w-4 h-4 mr-2" />
                        Đóng
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseCategoriesTab({ expenseCategories, onCategoryUpdate }) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    tenchiphi: '',
    loaichiphi: 'biến phí',
    giathanh: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `http://localhost:8001/api/v1/loaichiphi/${editingCategory.id}`
        : 'http://localhost:8001/api/v1/loaichiphi/';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenchiphi: categoryForm.tenchiphi,
          loaichiphi: categoryForm.loaichiphi,
          giathanh: categoryForm.loaichiphi === 'định phí' ? parseFloat(categoryForm.giathanh) || null : null
        })
      });

      if (response.ok) {
        setSuccess(true);
        setCategoryForm({ tenchiphi: '', loaichiphi: 'biến phí', giathanh: '' });
        setEditingCategory(null);
        onCategoryUpdate();

        // Đóng modal sau 2 giây
        setTimeout(() => {
          setShowCategoryForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi lưu loại chi phí');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Có lỗi xảy ra khi lưu loại chi phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/loaichiphi/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa loại chi phí thành công!');
        onCategoryUpdate();
      } else {
        alert('Có lỗi xảy ra khi xóa loại chi phí');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa loại chi phí');
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      tenchiphi: category.tenchiphi,
      loaichiphi: category.loaichiphi || 'biến phí',
      giathanh: category.giathanh ? category.giathanh.toString() : ''
    });
    setError('');
    setSuccess(false);
    setShowCategoryForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              Danh sách loại chi phí
            </h2>
            <p className="text-gray-600 mt-1">Quản lý và phân loại các khoản chi phí</p>
            <div className="flex items-center mt-2 text-sm text-green-700">
              <span className="bg-green-100 px-2 py-1 rounded-full">
                📊 {expenseCategories.length} loại chi phí
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCategoryForm(true);
              setEditingCategory(null);
              setCategoryForm({ tenchiphi: '', loaichiphi: 'biến phí', giathanh: '' });
              setError('');
              setSuccess(false);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm loại chi phí</span>
          </button>
        </div>
      </div>

      {/* Add Category Form - Inline */}
      {showCategoryForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Chỉnh sửa loại chi phí' : 'Thêm loại chi phí mới'}
                </h3>
                <p className="text-green-700 mt-1">Tạo danh mục chi phí cho doanh nghiệp của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setShowCategoryForm(false)}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
              title="Đóng"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">
                {editingCategory ? 'Cập nhật loại chi phí thành công!' : 'Thêm loại chi phí thành công!'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleCategorySubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-blue-600">🏷️</span>
                  </span>
                  Tên loại chi phí
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={categoryForm.tenchiphi}
                    onChange={(e) => setCategoryForm({...categoryForm, tenchiphi: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="Ví dụ: Văn phòng phẩm, Điện nước, Marketing..."
                    required
                  />
                  <div className="absolute right-4 top-4 text-gray-400">
                    <Settings className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Nhập tên loại chi phí rõ ràng và dễ hiểu
                </p>
              </div>

              {/* Type Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-purple-600">📊</span>
                  </span>
                  Loại chi phí
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={categoryForm.loaichiphi}
                    onChange={(e) => setCategoryForm({...categoryForm, loaichiphi: e.target.value, giathanh: e.target.value === 'biến phí' ? '' : categoryForm.giathanh})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
                    required
                  >
                    <option value="biến phí">Biến phí</option>
                    <option value="định phí">Định phí</option>
                  </select>
                  <div className="absolute right-4 top-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Biến phí thay đổi theo sản lượng, định phí cố định
                </p>
              </div>

              {/* Price Field - Only show for "định phí" */}
              {categoryForm.loaichiphi === 'định phí' && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-yellow-600">💰</span>
                    </span>
                    Giá thành cố định (VND)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={categoryForm.giathanh ? Number(categoryForm.giathanh).toLocaleString('vi-VN') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[.,\s]/g, '');
                        if (!isNaN(value) && value !== '') {
                          setCategoryForm({...categoryForm, giathanh: parseFloat(value)});
                        } else if (value === '') {
                          setCategoryForm({...categoryForm, giathanh: ''});
                        }
                      }}
                      className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                      placeholder="0"
                      required={categoryForm.loaichiphi === 'định phí'}
                    />
                    <div className="absolute right-4 top-4 text-gray-400">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Nhập giá thành cố định cho loại chi phí này (ví dụ: 5.000.000)
                  </p>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCategoryForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-semibold hover:shadow-md text-lg"
              >
                <div className="flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  Hủy
                </div>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    {editingCategory ? 'Cập nhật loại chi phí' : 'Thêm loại chi phí'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenseCategories.map(category => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-green-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-200">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg group-hover:text-green-700 transition-colors duration-200">
                    {category.tenchiphi}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {category.loaichiphi}
                    {category.loaichiphi === 'định phí' && category.giathanh && (
                      <span className="ml-2 font-medium text-green-600">
                        - {Number(category.giathanh).toLocaleString('vi-VN')} VND
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => editCategory(category)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg">
              Loại chi phí
            </div>
          </div>
        ))}
      </div>

      {expenseCategories.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có loại chi phí nào</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Hãy tạo loại chi phí đầu tiên để bắt đầu quản lý chi phí hiệu quả cho doanh nghiệp của bạn
          </p>
          <button
            onClick={() => {
              setShowCategoryForm(true);
              setEditingCategory(null);
              setCategoryForm({ tenchiphi: '' });
              setError('');
              setSuccess(false);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Tạo loại chi phí đầu tiên</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const getUser = async () => {
      // Check Supabase authentication first (for Admin users)
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      // Check localStorage session (for User/Manager users)
      const localSession = localStorage.getItem('user_session');
      let localUser = null;
      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          localUser = sessionData.user;
        } catch (error) {
          console.error('Error parsing localStorage session:', error);
          localStorage.removeItem('user_session'); // Clear invalid session
        }
      }

      // Use whichever authentication method has a valid user
      const currentUser = supabaseUser || localUser;
      setUser(currentUser);
      setLoading(false);

      // Load data if user is authenticated
      if (currentUser) {
        await loadData();
      }
    };
    getUser();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadExpenseCategories(),
        loadExpenses()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/quanly_chiphi/?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        console.error('Error loading expenses');
        setExpenses([]);
      }
    } catch (error) {
      console.error('Network error loading expenses:', error);
      setExpenses([]);
    }
  };

  const loadExpenseCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/loaichiphi/');
      if (response.ok) {
        const data = await response.json();
        setExpenseCategories(data);
      }
    } catch (error) {
      console.error('Error loading expense categories:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'expenses' || activeTab === 'overview') {
      loadExpenses();
    }
  }, [selectedMonth, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-lg text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <ExpensesLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <ExpensesOverviewTab
          expenses={expenses}
          expenseCategories={expenseCategories}
          selectedMonth={selectedMonth}
        />
      )}
      {activeTab === 'expenses' && (
        <ExpensesManagementTab
          expenses={expenses}
          expenseCategories={expenseCategories}
          selectedMonth={selectedMonth}
          onExpenseUpdate={loadExpenses}
        />
      )}
      {activeTab === 'categories' && (
        <ExpenseCategoriesTab
          expenseCategories={expenseCategories}
          onCategoryUpdate={loadExpenseCategories}
        />
      )}
    </ExpensesLayout>
  );
}
