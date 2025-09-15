'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings, RotateCcw, Save, RefreshCw, Download, Users, Wrench, Eye, EyeOff, X, Package, TrendingDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { uploadExpenseImage, deleteExpenseImage, testSupabaseStorage, testSupabaseConnection, testNetworkConnectivity, listAllBuckets, createExpenseFolder, testUploadWithPolicies } from '../../../lib/supabaseStorage';

const supabase = createClientComponentClient();

function ExpensesLayout({ user, activeTab, onTabChange, selectedMonth, onMonthChange, children }) {
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black bg-white"
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
  // Tổng chi phí = tổng của tất cả chi phí cha (không có parent_id)
  const totalExpenses = expenses
    .filter(expense => !expense.parent_id) // Chỉ lấy chi phí cha
    .reduce((sum, expense) => sum + (expense.giathanh || 0), 0);
  const expenseCount = expenses.length;

  const [hierarchyData, setHierarchyData] = useState([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Load hierarchy data for tree view
  useEffect(() => {
    loadHierarchyData();
  }, [selectedMonth]);

  const loadHierarchyData = async () => {
    setHierarchyLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/hierarchy/?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setHierarchyData(data.hierarchy || []);
        // Auto-expand root level
        const rootIds = new Set(data.hierarchy?.map(item => item.id) || []);
        setExpandedNodes(rootIds);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    } finally {
      setHierarchyLoading(false);
    }
  };

  // Toggle expand/collapse for tree nodes
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderExpenseNode = (expense, level = 0, parentAmount = null, parentName = null, totalRootAmount = null) => {
    const hasChildren = expense.children && expense.children.length > 0;
    const isExpanded = expandedNodes.has(expense.id);
    const indent = level * 24;

    // Tính tỉ lệ phần trăm so với tổng chi phí gốc (để hiển thị tỷ lệ tích lũy từ root)
    let rootPercentage = null;
    if (totalRootAmount && totalRootAmount > 0) {
      rootPercentage = ((expense.giathanh || 0) / totalRootAmount) * 100;
    }

    // Tính tỉ lệ phần trăm so với chi phí cha (để tham khảo)
    let parentPercentage = null;
    if (parentAmount && parentAmount > 0) {
      parentPercentage = ((expense.giathanh || 0) / parentAmount) * 100;
    }

    // Tính tổng tỉ lệ của tất cả chi phí con
    let totalChildrenAmount = 0;
    let totalChildrenPercentage = null;
    if (hasChildren) {
      totalChildrenAmount = expense.children.reduce((sum, child) => sum + (child.giathanh || 0), 0);
      if (expense.giathanh && expense.giathanh > 0) {
        totalChildrenPercentage = (totalChildrenAmount / expense.giathanh) * 100;
      }
    }

    return (
      <div key={expense.id}>
        <div 
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-2"
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleNode(expense.id)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6 h-6" />}
            
            <div className="p-2 bg-red-100 rounded-lg">
              <Receipt className="w-4 h-4 text-red-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{expense.loaichiphi?.tenchiphi || 'N/A'}</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    expense.loaichiphi?.loaichiphi === 'định phí' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {expense.loaichiphi?.loaichiphi || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                {expense.mo_ta && expense.mo_ta.trim() !== '' && (
                  <p className="text-sm text-blue-800 bg-blue-100 px-3 py-2 rounded-md border-l-2 border-blue-400 max-w-md font-medium">
                    📝 <span className="font-semibold">Mô tả:</span> {expense.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '')}
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      expense.mo_ta.startsWith('Nhóm chi phí') 
                        ? 'bg-orange-200 text-orange-900' 
                        : 'bg-green-200 text-green-900'
                    }`}>
                      {expense.mo_ta.startsWith('Nhóm chi phí') ? 'Nhóm chi phí' : 'Khoản chi phí'}
                    </span>
                  </p>
                )}
                {!expense.mo_ta || expense.mo_ta.trim() === '' ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1 rounded">
                    📝 Không có mô tả
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-bold text-red-600">{(expense.giathanh || 0).toLocaleString('vi-VN')} VND</p>
              {rootPercentage !== null && (
                <p className="text-sm text-green-600 font-medium">
                  {rootPercentage.toFixed(1)}% của tổng chi phí
                </p>
              )}
              {parentPercentage !== null && parentName && level > 0 && (
                <p className="text-sm text-blue-600 font-medium">
                  {parentPercentage.toFixed(1)}% của {parentName}
                </p>
              )}
              {hasChildren && totalChildrenPercentage !== null && (
                <p className="text-sm text-purple-600 font-medium">
                  Tổng con: {totalChildrenPercentage.toFixed(1)}% ({totalChildrenAmount.toLocaleString('vi-VN')} VND)
                </p>
              )}
              {expense.total_amount && expense.total_amount !== expense.giathanh && (
                <p className="text-sm text-gray-600">Tổng: {expense.total_amount.toLocaleString('vi-VN')} VND</p>
              )}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {expense.children.map(child => renderExpenseNode(child, level + 1, expense.giathanh || 0, expense.loaichiphi?.tenchiphi || expense.mo_ta || 'Chi phí cha', totalRootAmount))}
          </div>
        )}
      </div>
    );
  };

  const exportToExcel = async (exportType = 'current') => {
    let exportData = [];
    let fileName = '';

    if (exportType === 'current') {
      // Export current month data
      exportData = expenses.map(expense => ({
        'Ngày': expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : '',
        'Loại chi phí': expense.loaichiphi?.tenchiphi || 'N/A',
        'Mô tả': expense.mo_ta || '',
        'Số tiền (VND)': expense.giathanh || 0,
        'Loại': expense.loaichiphi?.loaichiphi || 'N/A'
      }));
      fileName = `chi_phi_${selectedMonth}.xlsx`;
    } else if (exportType === 'all') {
      // Export all expenses data
      try {
        const response = await fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi/');
        if (response.ok) {
          const allExpenses = await response.json();
          exportData = allExpenses.map(expense => ({
            'Ngày': expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : '',
            'Loại chi phí': expense.loaichiphi?.tenchiphi || 'N/A',
            'Mô tả': expense.mo_ta || '',
            'Số tiền (VND)': expense.giathanh || 0,
            'Loại': expense.loaichiphi?.loaichiphi || 'N/A'
          }));
          fileName = `tat_ca_chi_phi.xlsx`;
        } else {
          alert('Không thể tải dữ liệu tất cả chi phí');
          return;
        }
      } catch (error) {
        console.error('Error loading all expenses:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu');
        return;
      }
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Ngày
      { wch: 20 }, // Loại chi phí
      { wch: 30 }, // Mô tả
      { wch: 15 }, // Số tiền
      { wch: 12 }  // Loại
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi phí');

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan chi phí tháng {selectedMonth}</h2>
          <p className="text-gray-600 mt-1">Thống kê và phân tích chi phí</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              if (confirm('Bạn có muốn cập nhật lại tỷ lệ tổng chi phí cho tất cả chi phí cha không?')) {
                try {
                  const response = await fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi/update_totals/', {
                    method: 'POST'
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert('Đã cập nhật thành công tỷ lệ tổng chi phí!');
                    onExpenseUpdate(); // Refresh data
                  } else {
                    alert('Có lỗi khi cập nhật: ' + result.error);
                  }
                } catch (error) {
                  alert('Có lỗi khi cập nhật tỷ lệ tổng chi phí');
                }
              }
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            title="Cập nhật tỷ lệ tổng chi phí"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Cập nhật tỷ lệ</span>
          </button>
          <button
            onClick={() => exportToExcel('current')}
            disabled={expenses.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title="Xuất dữ liệu chi phí tháng hiện tại"
          >
            <Download className="w-4 h-4" />
            <span>Xuất tháng hiện tại</span>
          </button>
          <button
            onClick={() => exportToExcel('all')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            title="Xuất tất cả dữ liệu chi phí"
          >
            <Download className="w-4 h-4" />
            <span>Xuất tất cả</span>
          </button>
        </div>
      </div>
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
            expenses.filter(expense => !expense.parent_id).reduce((acc, expense) => {
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

      {/* Expense Structure Tree View */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cấu trúc cây chi phí</h3>
              <p className="text-sm text-gray-600 mt-1">Chi phí được hiển thị theo cấu trúc phân cấp</p>
            </div>
          </div>
        </div>

        {hierarchyLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải cấu trúc cây...</p>
          </div>
        ) : hierarchyData.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có chi phí nào trong tháng này</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-2">
              {(() => {
                const totalRootAmount = hierarchyData.reduce((sum, expense) => sum + (expense.giathanh || 0), 0);
                return hierarchyData.map(expense => renderExpenseNode(expense, 0, null, null, totalRootAmount));
              })()}
            </div>
          </div>
        )}
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
  const [showProductExpenseForm, setShowProductExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    id_lcp: '',
    giathanh: '',
    mo_ta: '',
    hinhanh: '',
    parent_id: '',
    created_at: new Date().toISOString().split('T')[0] // Default to today
  });
  const [productExpenseForm, setProductExpenseForm] = useState({
    product_id: '',
    giathanh: '',
    mo_ta: '',
    created_at: new Date().toISOString().split('T')[0]
  });
  const [products, setProducts] = useState([]);
  const [availableParents, setAvailableParents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [inlineEditingExpense, setInlineEditingExpense] = useState(null);
  const [inlineAddingParent, setInlineAddingParent] = useState(null);
  const [currentInlineFormSetter, setCurrentInlineFormSetter] = useState(null);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    tenchiphi: '',
    loaichiphi: 'biến phí',
    giathanh: ''
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categorySuccess, setCategorySuccess] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Load hierarchy data for tree view
  useEffect(() => {
    loadHierarchyData();
  }, [selectedMonth, expenses]);

  const loadHierarchyData = async () => {
    setHierarchyLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/hierarchy/?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setHierarchyData(data.hierarchy || []);
        // Auto-expand root level
        const rootIds = new Set(data.hierarchy?.map(item => item.id) || []);
        setExpandedNodes(rootIds);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    } finally {
      setHierarchyLoading(false);
    }
  };

  // Toggle expand/collapse for tree nodes
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/accounting/sanpham/');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Auto-update description preview when parent_id changes
  useEffect(() => {
    const isParentExpense = !expenseForm.parent_id || expenseForm.parent_id === '';
    const autoNote = isParentExpense ? 'Nhóm chi phí' : 'Khoản chi phí';
    
    // Update the description field to show preview
    if (expenseForm.mo_ta && !expenseForm.mo_ta.startsWith(autoNote)) {
      // If user has entered description, prepend the auto note
      setExpenseForm(prev => ({
        ...prev,
        mo_ta: `${autoNote}: ${prev.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '')}`
      }));
    } else if (!expenseForm.mo_ta) {
      // If no description, just show the auto note
      setExpenseForm(prev => ({
        ...prev,
        mo_ta: autoNote
      }));
    }
  }, [expenseForm.parent_id]);

  // Inline Expense Form Component
  const InlineExpenseForm = ({ expense, parentId, onSubmit, onCancel, expenseCategories, availableParents = [], onCategoryCreateStart }) => {
    const [formData, setFormData] = useState({
      id_lcp: expense?.id_lcp?.toString() || '',
      giathanh: expense?.giathanh ? expense.giathanh.toString() : '',
      mo_ta: expense?.mo_ta ? expense.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '') : '',
      parent_id: parentId ? parentId.toString() : (expense?.parent_id?.toString() || ''),
      created_at: expense?.created_at ? new Date(expense.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    // Determine if this is a parent expense (no parent_id)
    const isParentExpense = !formData.parent_id || formData.parent_id === '';

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      await onSubmit(formData);
      setLoading(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại chi phí <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center space-x-2">
              <div className="flex-1 relative">
                <select
                  value={formData.id_lcp}
                  onChange={(e) => {
                    const selectedCategoryId = e.target.value;
                    const selectedCategory = expenseCategories.find(cat => cat.id.toString() === selectedCategoryId);
                    
                    let newGiathanh = formData.giathanh;
                    if (selectedCategory && selectedCategory.loaichiphi === 'định phí' && selectedCategory.giathanh) {
                      newGiathanh = selectedCategory.giathanh.toString();
                    } else if (selectedCategory && selectedCategory.loaichiphi === 'biến phí') {
                      newGiathanh = '';
                    }
                    
                    setFormData({...formData, id_lcp: selectedCategoryId, giathanh: newGiathanh});
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
              <button
                type="button"
                onClick={() => {
                  if (onCategoryCreateStart) {
                    onCategoryCreateStart((newCategoryId) => {
                      const selectedCategory = expenseCategories.find(cat => cat.id.toString() === newCategoryId);
                      
                      let newGiathanh = formData.giathanh;
                      if (selectedCategory && selectedCategory.loaichiphi === 'định phí' && selectedCategory.giathanh) {
                        newGiathanh = selectedCategory.giathanh.toString();
                      } else if (selectedCategory && selectedCategory.loaichiphi === 'biến phí') {
                        newGiathanh = '';
                      }
                      
                      setFormData({...formData, id_lcp: newCategoryId, giathanh: newGiathanh});
                    });
                  }
                  setShowCreateCategoryModal(true);
                }}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Tạo loại chi phí mới"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền (VND) {isParentExpense && <span className="text-blue-600">(tự động tính)</span>}
              {!isParentExpense && <span className="text-gray-500">(có thể để trống)</span>}
            </label>
            <input
              type="text"
              value={formData.giathanh ? Number(formData.giathanh).toLocaleString('vi-VN') : ''}
              onChange={(e) => {
                if (!isParentExpense) {
                  const value = e.target.value.replace(/[.,\s]/g, '');
                  if (!isNaN(value) && value !== '') {
                    setFormData({...formData, giathanh: parseFloat(value)});
                  } else if (value === '') {
                    setFormData({...formData, giathanh: ''});
                  }
                }
              }}
              className={`w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg ${
                isParentExpense ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
              }`}
              placeholder={isParentExpense ? "Tự động tính từ chi phí con" : "Có thể để trống"}
              disabled={isParentExpense}
            />
            {isParentExpense && (
              <p className="text-xs text-blue-600 mt-1">
                Số tiền cha được tính tự động bằng tổng chi phí con
              </p>
            )}
            {!isParentExpense && (
              <p className="text-xs text-gray-500 mt-1">
                Có thể để trống nếu chưa xác định số tiền
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày chi phí <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.created_at}
              onChange={(e) => setFormData({...formData, created_at: e.target.value})}
              className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <input
              type="text"
              value={formData.mo_ta}
              onChange={(e) => setFormData({...formData, mo_ta: e.target.value})}
              className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
              placeholder="Nhập mô tả..."
            />
          </div>

          {/* Parent Expense Selection - only show when adding new expense (not editing) */}
          {!expense && availableParents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi phí cha
                <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
              >
                <option value="">Không có chi phí cha (chi phí gốc)</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id.toString()}>
                    {parent.mo_ta || 'Không có mô tả'} - {parent.loaichiphi?.tenchiphi || 'N/A'} - {(parent.giathanh || 0).toLocaleString('vi-VN')} VND
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Chọn chi phí cha để tạo cấu trúc phân cấp
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Đang xử lý...' : (expense ? 'Cập nhật' : 'Thêm')}
          </button>
        </div>
      </form>
    );
  };

  // Handle inline expense submission
  const handleInlineExpenseSubmit = async (formData, isEditing) => {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `http://localhost:8001/api/v1/accounting/quanly_chiphi/${inlineEditingExpense}`
        : 'http://localhost:8001/api/v1/accounting/quanly_chiphi/';

      // Prepare the data to send
      const isParentExpense = !formData.parent_id || formData.parent_id === '';
      const autoNote = isParentExpense ? 'Nhóm chi phí' : 'Khoản chi phí';
      
      const dataToSend = {
        id_lcp: formData.id_lcp ? parseInt(formData.id_lcp) : null,
        giathanh: isParentExpense ? null : (parseFloat(formData.giathanh) || null), // Parent expenses don't send amount, it will be calculated
        mo_ta: formData.mo_ta ? `${autoNote}: ${formData.mo_ta}` : autoNote,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        created_at: formData.created_at ? new Date(formData.created_at).toISOString() : new Date().toISOString()
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        onExpenseUpdate();
        // Reset inline states
        setInlineEditingExpense(null);
        setInlineAddingParent(null);
      } else {
        let errorMessage = 'Có lỗi xảy ra khi lưu chi phí';
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Lỗi máy chủ'}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Có lỗi xảy ra khi lưu chi phí. Vui lòng thử lại.');
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa chi phí thành công!');
        onExpenseUpdate();
      } else {
        alert('Có lỗi xảy ra khi xóa chi phí');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Có lỗi xảy ra khi xóa chi phí');
    }
  };

  const renderExpenseNode = (expense, level = 0, parentAmount = null, parentName = null, totalRootAmount = null) => {
    const hasChildren = expense.children && expense.children.length > 0;
    const isExpanded = expandedNodes.has(expense.id);
    const indent = level * 24;
    const isInlineEditing = inlineEditingExpense === expense.id;
    const isInlineAdding = inlineAddingParent === expense.id;

    // Tính tỉ lệ phần trăm so với tổng chi phí gốc (để hiển thị tỷ lệ tích lũy từ root)
    let rootPercentage = null;
    if (totalRootAmount && totalRootAmount > 0) {
      rootPercentage = ((expense.giathanh || 0) / totalRootAmount) * 100;
    }

    // Tính tỉ lệ phần trăm so với chi phí cha (để tham khảo)
    let parentPercentage = null;
    if (parentAmount && parentAmount > 0) {
      parentPercentage = ((expense.giathanh || 0) / parentAmount) * 100;
    }

    // Tính tổng tỉ lệ của tất cả chi phí con
    let totalChildrenAmount = 0;
    let totalChildrenPercentage = null;
    if (hasChildren) {
      totalChildrenAmount = expense.children.reduce((sum, child) => sum + (child.giathanh || 0), 0);
      if (expense.giathanh && expense.giathanh > 0) {
        totalChildrenPercentage = (totalChildrenAmount / expense.giathanh) * 100;
      }
    }

    return (
      <div key={expense.id}>
        <div 
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-2"
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleNode(expense.id)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6 h-6" />}
            
            <div className="p-2 bg-red-100 rounded-lg">
              <Receipt className="w-4 h-4 text-red-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{expense.loaichiphi?.tenchiphi || 'N/A'}</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    expense.loaichiphi?.loaichiphi === 'định phí' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {expense.loaichiphi?.loaichiphi || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                {expense.mo_ta && expense.mo_ta.trim() !== '' && (
                  <p className="text-sm text-blue-800 bg-blue-100 px-3 py-2 rounded-md border-l-2 border-blue-400 max-w-md font-medium">
                    📝 <span className="font-semibold">Mô tả:</span> {expense.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '')}
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      expense.mo_ta.startsWith('Nhóm chi phí') 
                        ? 'bg-orange-200 text-orange-900' 
                        : 'bg-green-200 text-green-900'
                    }`}>
                      {expense.mo_ta.startsWith('Nhóm chi phí') ? 'Nhóm chi phí' : 'Khoản chi phí'}
                    </span>
                  </p>
                )}
                {!expense.mo_ta || expense.mo_ta.trim() === '' ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1 rounded">
                    📝 Không có mô tả
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-bold text-red-600">{(expense.giathanh || 0).toLocaleString('vi-VN')} VND</p>
              {rootPercentage !== null && (
                <p className="text-sm text-green-600 font-medium">
                  {rootPercentage.toFixed(1)}% của tổng chi phí
                </p>
              )}
              {parentPercentage !== null && parentName && level > 0 && (
                <p className="text-sm text-blue-600 font-medium">
                  {parentPercentage.toFixed(1)}% của {parentName}
                </p>
              )}
              {hasChildren && totalChildrenPercentage !== null && (
                <p className="text-sm text-purple-600 font-medium">
                  Tổng con: {totalChildrenPercentage.toFixed(1)}% ({totalChildrenAmount.toLocaleString('vi-VN')} VND)
                </p>
              )}
              {expense.total_amount && expense.total_amount !== expense.giathanh && (
                <p className="text-sm text-gray-600">Tổng: {expense.total_amount.toLocaleString('vi-VN')} VND</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setInlineAddingParent(expense.id)}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="Thêm chi phí con"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setInlineEditingExpense(expense.id)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-all duration-200"
                title="Chỉnh sửa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteExpense(expense.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Inline Add Form */}
        {isInlineAdding && (
          <div className="mb-4 p-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-200 rounded-2xl shadow-md" style={{ marginLeft: `${indent + 24}px` }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Thêm chi phí con</h4>
              <button
                onClick={() => setInlineAddingParent(null)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                title="Hủy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <InlineExpenseForm
              parentId={expense.id}
              onSubmit={async (formData) => {
                await handleInlineExpenseSubmit(formData, false);
                setInlineAddingParent(null);
              }}
              onCancel={() => setInlineAddingParent(null)}
              expenseCategories={expenseCategories}
              availableParents={availableParents}
              onCategoryCreateStart={(setter) => setCurrentInlineFormSetter(() => setter)}
            />
          </div>
        )}

        {/* Inline Edit Form */}
        {isInlineEditing && (
          <div className="mb-4 p-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-200 rounded-2xl shadow-md" style={{ marginLeft: `${indent}px` }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Chỉnh sửa chi phí</h4>
              <button
                onClick={() => setInlineEditingExpense(null)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                title="Hủy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <InlineExpenseForm
              expense={expense}
              onSubmit={async (formData) => {
                await handleInlineExpenseSubmit(formData, true);
                setInlineEditingExpense(null);
              }}
              onCancel={() => setInlineEditingExpense(null)}
              expenseCategories={expenseCategories}
              availableParents={availableParents}
              onCategoryCreateStart={(setter) => setCurrentInlineFormSetter(() => setter)}
            />
          </div>
        )}
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {expense.children.map(child => renderExpenseNode(child, level + 1, expense.giathanh || 0, expense.loaichiphi?.tenchiphi || expense.mo_ta || 'Chi phí cha', totalRootAmount))}
          </div>
        )}
      </div>
    );
  };
  const exportToExcel = () => {
    // Prepare data for Excel export
    const exportData = expenses.map(expense => ({
      'Ngày': expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : '',
      'Loại chi phí': expense.loaichiphi?.tenchiphi || 'N/A',
      'Mô tả': expense.mo_ta || '',
      'Số tiền (VND)': expense.giathanh || 0,
      'Loại': expense.loaichiphi?.loaichiphi || 'N/A'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Ngày
      { wch: 20 }, // Loại chi phí
      { wch: 30 }, // Mô tả
      { wch: 15 }, // Số tiền
      { wch: 12 }  // Loại
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi phí');

    // Generate filename with current month
    const fileName = `chi_phi_${selectedMonth}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreatingCategory(true);
    setCategoryError('');
    setCategorySuccess(false);

    try {
      const response = await fetch('http://localhost:8001/api/v1/accounting/loaichiphi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenchiphi: newCategoryForm.tenchiphi,
          loaichiphi: newCategoryForm.loaichiphi,
          giathanh: newCategoryForm.loaichiphi === 'định phí' ? parseFloat(newCategoryForm.giathanh) || null : null
        })
      });

      if (response.ok) {
        const newCategory = await response.json();
        // Refresh categories list
        await loadExpenseCategories();
        // Set the new category as selected in the main form
        setExpenseForm(prev => ({...prev, id_lcp: newCategory.id.toString()}));
        // Set the new category as selected in the current inline form if exists
        if (currentInlineFormSetter) {
          currentInlineFormSetter(newCategory.id.toString());
        }
        // Reset form and close modal
        setNewCategoryForm({ tenchiphi: '', loaichiphi: 'biến phí', giathanh: '' });
        setCategorySuccess(true);
        setShowCreateCategoryModal(false);
        setCurrentInlineFormSetter(null);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setCategorySuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setCategoryError(errorData.detail || 'Lỗi khi tạo loại chi phí: ' + (errorData.detail || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setCategoryError('Lỗi khi tạo loại chi phí. Vui lòng thử lại.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const loadExpenseCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/accounting/loaichiphi/');
      if (response.ok) {
        const data = await response.json();
        setExpenseCategories(data);
      }
    } catch (error) {
      console.error('Error loading expense categories:', error);
    }
  };

  // Handle file selection for image upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadStatus({ type: 'error', message: 'Chỉ chấp nhận file hình ảnh' });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({ type: 'error', message: 'File quá lớn. Tối đa 5MB' });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus(null);
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

    // Chỉ bắt buộc nhập giá khi là chi phí con (có parent_id)
    if ((expenseForm.parent_id && expenseForm.parent_id !== '') && (!expenseForm.giathanh || expenseForm.giathanh === '')) {
      setError('Vui lòng nhập số tiền (bắt buộc cho chi phí con)');
      setLoading(false);
      return;
    }

    // Cho phép parent expenses có thể để null cho giathanh

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
        ? `http://localhost:8001/api/v1/accounting/quanly_chiphi/${editingExpense.id}`
        : 'http://localhost:8001/api/v1/accounting/quanly_chiphi/';

      // Prepare the data to send
      const isParentExpense = !expenseForm.parent_id || expenseForm.parent_id === '';
      const autoNote = isParentExpense ? 'Nhóm chi phí' : 'Khoản chi phí';
      
      const dataToSend = {
        id_lcp: expenseForm.id_lcp ? parseInt(expenseForm.id_lcp) : null,
        giathanh: isParentExpense ? (parseFloat(expenseForm.giathanh) || null) : (parseFloat(expenseForm.giathanh) || null), // Parent expenses can have null amount
        mo_ta: expenseForm.mo_ta ? `${autoNote}: ${expenseForm.mo_ta}` : autoNote,
        hinhanh: imageUrl || expenseForm.hinhanh || null,
        parent_id: expenseForm.parent_id ? parseInt(expenseForm.parent_id) : null,
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
          parent_id: '',
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
        let errorMessage = 'Có lỗi xảy ra khi lưu chi phí';
        try {
          const errorData = await response.json();
          console.log('Raw error data:', errorData); // Debug log
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData && Object.keys(errorData).length > 0) {
            // If there are other error fields, try to extract meaningful error
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          } else {
            // Empty response or no meaningful error data
            errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Không thể lưu chi phí'}`;
          }
        } catch (parseError) {
          console.log('JSON parse error:', parseError); // Debug log
          // If JSON parsing fails, use status-based error
          errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Lỗi máy chủ'}`;
        }
        console.error('API Error details:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : 'no response'
        });
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Có lỗi xảy ra khi lưu chi phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProductExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('product_id', productExpenseForm.product_id);
      formData.append('giathanh', productExpenseForm.giathanh);
      formData.append('mo_ta', productExpenseForm.mo_ta);
      formData.append('created_at', productExpenseForm.created_at);

      const response = await fetch('http://localhost:8001/api/v1/accounting/bien-phi-san-pham/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        setProductExpenseForm({
          product_id: '',
          giathanh: '',
          mo_ta: '',
          created_at: new Date().toISOString().split('T')[0]
        });
        setShowProductExpenseForm(false);
        onExpenseUpdate();
      } else {
        let errorMessage = 'Có lỗi xảy ra khi thêm biến phí sản phẩm';
        try {
          const errorData = await response.json();
          console.log('Raw error data (product expense):', errorData); // Debug log
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData && Object.keys(errorData).length > 0) {
            // If there are other error fields, try to extract meaningful error
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          } else {
            // Empty response or no meaningful error data
            errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Không thể thêm biến phí sản phẩm'}`;
          }
        } catch (parseError) {
          console.log('JSON parse error (product expense):', parseError); // Debug log
          // If JSON parsing fails, use status-based error
          errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Lỗi máy chủ'}`;
        }
        console.error('API Error details (product expense):', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : 'no response'
        });
        setError(errorMessage);
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const editExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      id_lcp: expense.id_lcp?.toString() || '',
      giathanh: expense.giathanh ? expense.giathanh.toString() : '', // Parent expenses may not have amount set
      mo_ta: expense.mo_ta ? expense.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '') : '',
      hinhanh: expense.hinhanh || '',
      parent_id: expense.parent_id?.toString() || '',
      created_at: expense.created_at ? new Date(expense.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
    setPreviewUrl(expense.hinhanh || '');
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
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              if (confirm('Bạn có muốn cập nhật lại tỷ lệ tổng chi phí cho tất cả chi phí cha không?')) {
                try {
                  const response = await fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi/update_totals/', {
                    method: 'POST'
                  });
                  const result = await response.json();
                  if (result.success) {
                    alert('Đã cập nhật thành công tỷ lệ tổng chi phí!');
                    onExpenseUpdate(); // Refresh data
                  } else {
                    alert('Có lỗi khi cập nhật: ' + result.error);
                  }
                } catch (error) {
                  alert('Có lỗi khi cập nhật tỷ lệ tổng chi phí');
                }
              }
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            title="Cập nhật tỷ lệ tổng chi phí"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Cập nhật tỷ lệ</span>
          </button>
          <button
            onClick={exportToExcel}
            disabled={expenses.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title="Xuất dữ liệu chi phí ra file Excel"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => {
              setShowProductExpenseForm(true);
              setProductExpenseForm({
                product_id: '',
                giathanh: '',
                mo_ta: '',
                created_at: new Date().toISOString().split('T')[0]
              });
              setError('');
              setSuccess(false);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Thêm biến phí sản phẩm</span>
          </button>
          <button
            onClick={() => {
              setShowExpenseForm(true);
              setEditingExpense(null);
              setExpenseForm({
                id_lcp: '',
                giathanh: '',
                mo_ta: '',
                hinhanh: '',
                parent_id: '',
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
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-8 border-2 border-red-200 mb-8">
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
                <div className="relative flex items-center space-x-2">
                  <div className="flex-1 relative">
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
                  <button
                    type="button"
                    onClick={() => setShowCreateCategoryModal(true)}
                    className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    title="Tạo loại chi phí mới"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Chọn loại chi phí từ danh sách có sẵn hoặc tạo mới
                </p>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-green-600">💰</span>
                  </span>
                  Số tiền (VND)
                  {(!expenseForm.parent_id || expenseForm.parent_id === '') && <span className="text-blue-600 ml-2">(có thể để trống)</span>}
                  {(expenseForm.parent_id && expenseForm.parent_id !== '') && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={expenseForm.giathanh ? Number(expenseForm.giathanh).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      if (expenseForm.parent_id && expenseForm.parent_id !== '') {
                        const value = e.target.value.replace(/[.,\s]/g, '');
                        if (!isNaN(value) && value !== '') {
                          setExpenseForm({...expenseForm, giathanh: parseFloat(value)});
                        } else if (value === '') {
                          setExpenseForm({...expenseForm, giathanh: ''});
                        }
                      } else {
                        // Allow editing for parent expenses
                        const value = e.target.value.replace(/[.,\s]/g, '');
                        if (!isNaN(value) && value !== '') {
                          setExpenseForm({...expenseForm, giathanh: parseFloat(value)});
                        } else if (value === '') {
                          setExpenseForm({...expenseForm, giathanh: ''});
                        }
                      }
                    }}
                    className={`w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg ${
                      false ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder={(!expenseForm.parent_id || expenseForm.parent_id === '') ? "Có thể để trống hoặc nhập số tiền cụ thể" : "0"}
                    required={expenseForm.parent_id && expenseForm.parent_id !== ''}
                    disabled={false}
                  />
                  <div className="absolute right-4 top-4 text-gray-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  {(!expenseForm.parent_id || expenseForm.parent_id === '') 
                    ? 'Chi phí cha có thể để trống (sẽ được tính từ tổng chi phí con) hoặc nhập số tiền cụ thể.' 
                    : 'Nhập số tiền chính xác cho chi phí con này.'
                  }
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

              {/* Parent Expense Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-indigo-600">🔗</span>
                  </span>
                  Chi phí cha
                  <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                </label>
                <div className="relative">
                  <select
                    value={expenseForm.parent_id}
                    onChange={(e) => setExpenseForm({...expenseForm, parent_id: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
                  >
                    <option value="">Không có chi phí cha (chi phí gốc)</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id.toString()}>
                        {parent.mo_ta || 'Không có mô tả'} - {parent.loaichiphi?.tenchiphi || 'N/A'} - {(parent.giathanh || 0).toLocaleString('vi-VN')} VND
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
                  Chọn chi phí cha để tạo cấu trúc phân cấp. 
                  {(!expenseForm.parent_id || expenseForm.parent_id === '') && (
                    <span className="text-orange-600 font-medium ml-1">
                      Lưu ý: Tổng chi phí con phải bằng chi phí cha.
                    </span>
                  )}
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
      )}

      {/* Create Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl max-w-2xl w-full border-2 border-blue-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Tạo loại chi phí mới</h3>
                    <p className="text-blue-700 mt-1">Thêm loại chi phí vào danh sách quản lý</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateCategoryModal(false);
                    setCurrentInlineFormSetter(null);
                    setCategorySuccess(false);
                    setCategoryError('');
                  }}
                  className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Đóng"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Success Message */}
              {categorySuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Tạo loại chi phí thành công!</p>
                </div>
              )}

              {/* Error Message */}
              {categoryError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{categoryError}</p>
                </div>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-8">
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
                        value={newCategoryForm.tenchiphi}
                        onChange={(e) => setNewCategoryForm({...newCategoryForm, tenchiphi: e.target.value})}
                        className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                        placeholder="Ví dụ: Văn phòng phẩm, Điện nước..."
                        required
                      />
                      <div className="absolute right-4 top-4 text-gray-400">
                        <Plus className="w-6 h-6" />
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
                        value={newCategoryForm.loaichiphi}
                        onChange={(e) => setNewCategoryForm({...newCategoryForm, loaichiphi: e.target.value, giathanh: e.target.value === 'biến phí' ? '' : newCategoryForm.giathanh})}
                        className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
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
                  {newCategoryForm.loaichiphi === 'định phí' && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xs text-yellow-600">💰</span>
                        </span>
                        Giá thành cố định (VND)
                        <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newCategoryForm.giathanh ? Number(newCategoryForm.giathanh).toLocaleString('vi-VN') : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[.,\s]/g, '');
                            if (!isNaN(value) && value !== '') {
                              setNewCategoryForm({...newCategoryForm, giathanh: parseFloat(value)});
                            } else if (value === '') {
                              setNewCategoryForm({...newCategoryForm, giathanh: ''});
                            }
                          }}
                          className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                          placeholder="0"
                        />
                        <div className="absolute right-4 top-4 text-gray-400">
                          <DollarSign className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 flex items-center">
                        <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">💡</span>
                        </span>
                        Có thể để trống nếu chưa xác định giá thành cố định
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCategoryModal(false);
                      setCurrentInlineFormSetter(null);
                      setCategorySuccess(false);
                      setCategoryError('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-semibold hover:shadow-md text-lg"
                  >
                    <div className="flex items-center justify-center">
                      <X className="w-5 h-5 mr-2" />
                      Hủy
                    </div>
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCategory}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
                  >
                    {creatingCategory ? (
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
                        Tạo loại chi phí
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Expense Form Modal */}
      {showProductExpenseForm && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 border-2 border-purple-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Thêm biến phí sản phẩm</h3>
                <p className="text-purple-700 mt-1">Thêm chi phí biến phí cho sản phẩm cụ thể</p>
              </div>
            </div>
            <button
              onClick={() => setShowProductExpenseForm(false)}
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
              <p className="text-sm font-medium">Thêm biến phí sản phẩm thành công!</p>
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

          <form onSubmit={handleSubmitProductExpense} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Selection Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-blue-600">📦</span>
                  </span>
                  Tên sản phẩm
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={productExpenseForm.product_id}
                    onChange={(e) => setProductExpenseForm({...productExpenseForm, product_id: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
                    required
                  >
                    <option value="">Chọn sản phẩm...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id.toString()}>
                        {product.ten_san_pham}
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
                  Chọn sản phẩm từ danh sách có sẵn
                </p>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-green-600">💰</span>
                  </span>
                  Số tiền (VND)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={productExpenseForm.giathanh ? Number(productExpenseForm.giathanh).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[.,\s]/g, '');
                      if (!isNaN(value) && value !== '') {
                        setProductExpenseForm({...productExpenseForm, giathanh: parseFloat(value)});
                      } else if (value === '') {
                        setProductExpenseForm({...productExpenseForm, giathanh: ''});
                      }
                    }}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
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
                  Nhập số tiền biến phí cho sản phẩm này
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
                    value={productExpenseForm.created_at}
                    onChange={(e) => setProductExpenseForm({...productExpenseForm, created_at: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
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
                  Chọn ngày thực hiện chi phí biến phí
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-gray-600">📝</span>
                  </span>
                  Mô tả
                  <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={productExpenseForm.mo_ta}
                    onChange={(e) => setProductExpenseForm({...productExpenseForm, mo_ta: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg resize-none"
                    placeholder="Nhập mô tả chi phí biến phí..."
                    rows={3}
                  />
                  <div className="absolute right-4 top-4 text-gray-400">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Mô tả chi tiết về khoản chi phí biến phí này
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowProductExpenseForm(false)}
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
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
                    <Package className="w-5 h-5 mr-2" />
                    Thêm biến phí sản phẩm
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc chi phí</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() => {
              setSelectedMonth(new Date().toISOString().slice(0, 7));
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Expenses Tree View */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cấu trúc cây chi phí</h3>
              <p className="text-sm text-gray-600 mt-1">Chi phí được hiển thị theo cấu trúc phân cấp</p>
            </div>
          </div>
        </div>

        {hierarchyLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải cấu trúc cây...</p>
          </div>
        ) : hierarchyData.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có chi phí nào trong tháng này</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-2">
              {(() => {
                const filteredData = hierarchyData.filter(expense => {
                  return true;
                });
                const totalRootAmount = filteredData.reduce((sum, expense) => sum + (expense.giathanh || 0), 0);
                return filteredData.map(expense => renderExpenseNode(expense, 0, null, null, totalRootAmount));
              })()}
            </div>
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
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedExpense.mo_ta && selectedExpense.mo_ta.startsWith('Nhóm chi phí') 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedExpense.mo_ta && selectedExpense.mo_ta.startsWith('Nhóm chi phí') ? 'Nhóm chi phí' : 'Khoản chi phí'}
                          </span>
                        </div>
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
                          {selectedExpense.mo_ta ? selectedExpense.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '') : 'Không có mô tả'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Price Info */}
                  {selectedExpense.loaichiphi?.loaichiphi === 'định phí' && selectedExpense.loaichiphi?.giathanh && (
                    <div className="bg-blue-100 rounded-xl p-6 border border-blue-300">
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

<style jsx>{`
  .expense-node {
    position: relative;
  }

  .expense-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    transition: all 0.2s;
  }

  .expense-row:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  .expense-info {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .expand-btn {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    margin-right: 0.5rem;
    transition: color 0.2s;
  }

  .expand-btn:hover {
    color: #374151;
  }

  .expand-spacer {
    width: 2rem;
    margin-right: 0.5rem;
    color: #9ca3af;
    font-size: 1.2rem;
  }

  .expense-details {
    flex: 1;
  }

  .expense-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .expense-description {
    font-weight: 600;
    color: #111827;
    font-size: 0.95rem;
  }

  .expense-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  .parent-badge {
    background: #fed7aa;
    color: #9a3412;
  }

  .child-badge {
    background: #bbf7d0;
    color: #166534;
  }

  .expense-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .expense-category {
    color: #374151;
    font-weight: 500;
  }

  .expense-amount {
    color: #dc2626;
    font-weight: 600;
  }

  .expense-children-count {
    color: #059669;
    font-weight: 500;
  }

  .expense-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .expense-children {
    margin-left: 2rem;
    padding-left: 1rem;
    border-left: 2px solid #e5e7eb;
  }

  .btn {
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-sm {
    padding: 0.25rem;
    width: 2rem;
    height: 2rem;
  }

  .btn-outline-primary {
    background: white;
    border: 1px solid #3b82f6;
    color: #3b82f6;
  }

  .btn-outline-primary:hover {
    background: #3b82f6;
    color: white;
  }

  .btn-outline-danger {
    background: white;
    border: 1px solid #dc2626;
    color: #dc2626;
  }

  .btn-outline-danger:hover {
    background: #dc2626;
    color: white;
  }
`}</style>

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
        ? `http://localhost:8001/api/v1/accounting/loaichiphi/${editingCategory.id}`
        : 'http://localhost:8001/api/v1/accounting/loaichiphi/';

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
        let errorMessage = 'Có lỗi xảy ra khi lưu loại chi phí';
        try {
          const errorData = await response.json();
          console.log('Raw error data (category):', errorData); // Debug log
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData && Object.keys(errorData).length > 0) {
            // If there are other error fields, try to extract meaningful error
            const firstError = Object.values(errorData)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          } else {
            // Empty response or no meaningful error data
            errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Không thể lưu loại chi phí'}`;
          }
        } catch (parseError) {
          console.log('JSON parse error (category):', parseError); // Debug log
          // If JSON parsing fails, use status-based error
          errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Lỗi máy chủ'}`;
        }
        console.error('API Error details (category):', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : 'no response'
        });
        setError(errorMessage);
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
      const response = await fetch(`http://localhost:8001/api/v1/accounting/loaichiphi/${categoryId}`, {
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
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8 border-2 border-green-200 mb-8">
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
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-all duration-200"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
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
      const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/?month=${selectedMonth}`);
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
      const response = await fetch('http://localhost:8001/api/v1/accounting/loaichiphi/');
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
    <ExpensesLayout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
    >
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
