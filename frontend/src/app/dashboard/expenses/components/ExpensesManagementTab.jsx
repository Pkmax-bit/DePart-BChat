import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Receipt, FileText, Info, Calendar, Save, RefreshCw, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { uploadExpenseImage, deleteExpenseImage } from '../../../lib/supabaseStorage';
import ExpenseTreeNode from './ExpenseTreeNode';
import ExpenseDetailModal from './ExpenseDetailModal';
import CreateCategoryModal from './CreateCategoryModal';

function ExpensesManagementTab({ expenses, expenseCategories, selectedMonth, onExpenseUpdate }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    id_lcp: '',
    giathanh: '',
    mo_ta: '',
    hinhanh: '',
    parent_id: '',
    created_at: new Date().toISOString().split('T')[0] // Default to today
  });
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

        // Cập nhật tỷ lệ tổng chi phí sau khi thêm/chỉnh sửa inline
        try {
          await fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi/update_ratios/', {
            method: 'POST'
          });
        } catch (updateError) {
          console.error('Error updating totals:', updateError);
        }
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

  const exportToExcel = () => {
    // Helper function to flatten hierarchy with hierarchical numbering
    const flattenHierarchy = (expenses, prefix = '', parentAmount = null, totalRootAmount = null) => {
      const result = [];
      let counter = 1;

      expenses.forEach(expense => {
        // Create hierarchical number
        const hierarchicalNumber = prefix ? `${prefix}.${counter}` : counter.toString();

        // Calculate percentages - use backend-stored ti_le if available, otherwise calculate
        let rootPercentage = null;
        let parentPercentage = null;

        if (expense.ti_le !== null && expense.ti_le !== undefined) {
          // Use backend-stored ratio
          rootPercentage = expense.ti_le;
        } else if (totalRootAmount && totalRootAmount > 0) {
          // Fallback to frontend calculation
          rootPercentage = ((expense.giathanh || 0) / totalRootAmount) * 100;
        }

        if (parentAmount && parentAmount > 0) {
          parentPercentage = ((expense.giathanh || 0) / parentAmount) * 100;
        }

        // Add current expense
        result.push({
          'STT': hierarchicalNumber,
          'Tên chi phí': expense.loaichiphi?.tenchiphi || 'N/A',
          'Loại chi phí': expense.loaichiphi?.loaichiphi || 'N/A',
          'Số tiền': expense.giathanh || 0,
          'Tỉ lệ': rootPercentage !== null ? `${rootPercentage.toFixed(1)}%` : 'N/A',
          'Cấp bậc': hierarchicalNumber,
          'Ngày': expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : ''
        });

        // Process children recursively
        if (expense.children && expense.children.length > 0) {
          const childResults = flattenHierarchy(expense.children, hierarchicalNumber, expense.giathanh || 0, totalRootAmount);
          result.push(...childResults);
        }

        counter++;
      });

      return result;
    };

    // Prepare data for Excel export with hierarchical structure
    const totalRootAmount = hierarchyData.reduce((sum, expense) => sum + (expense.giathanh || 0), 0);
    const exportData = flattenHierarchy(hierarchyData, '', null, totalRootAmount);

    // Calculate totals for root level expenses (STT 1, 2, 3, 4, 5, ...)
    const rootExpenses = hierarchyData;
    const totalAmount = rootExpenses.reduce((sum, expense) => sum + (expense.giathanh || 0), 0);
    const totalPercentage = rootExpenses.reduce((sum, expense) => {
      if (expense.ti_le !== null && expense.ti_le !== undefined) {
        return sum + expense.ti_le;
      } else if (totalRootAmount && totalRootAmount > 0) {
        return sum + ((expense.giathanh || 0) / totalRootAmount) * 100;
      }
      return sum;
    }, 0);

    // Add total row
    exportData.push({
      'STT': 'TỔNG',
      'Tên chi phí': '',
      'Loại chi phí': '',
      'Số tiền': totalAmount,
      'Tỉ lệ': `${totalPercentage.toFixed(1)}%`,
      'Cấp bậc': '',
      'Ngày': ''
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 8 },  // STT
      { wch: 20 }, // Tên chi phí
      { wch: 12 }, // Loại chi phí
      { wch: 15 }, // Số tiền
      { wch: 12 }, // Tỉ lệ
      { wch: 8 },  // Cấp bậc
      { wch: 12 }  // Ngày
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

        // Cập nhật tỷ lệ tổng chi phí sau khi thêm/chỉnh sửa
        try {
          await fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi/update_ratios/', {
            method: 'POST'
          });
        } catch (updateError) {
          console.error('Error updating ratios:', updateError);
        }

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
                    <span className="text-xs text-yellow-600">🖼️</span>
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
      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => {
          setShowCreateCategoryModal(false);
          setCurrentInlineFormSetter(null);
          setCategorySuccess(false);
          setCategoryError('');
        }}
        onSubmit={handleCreateCategory}
        loading={creatingCategory}
        error={categoryError}
        success={categorySuccess}
        newCategoryForm={newCategoryForm}
        setNewCategoryForm={setNewCategoryForm}
      />

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
                return filteredData.map(expense => (
                  <ExpenseTreeNode
                    key={expense.id}
                    expense={expense}
                    level={0}
                    parentAmount={null}
                    parentName={null}
                    totalRootAmount={totalRootAmount}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    onInlineEdit={(id) => setInlineEditingExpense(id)}
                    onInlineAdd={(id) => setInlineAddingParent(id)}
                    onDelete={deleteExpense}
                    onInlineSubmit={handleInlineExpenseSubmit}
                    expenseCategories={expenseCategories}
                    availableParents={availableParents}
                    onCategoryCreateStart={(setter) => setCurrentInlineFormSetter(() => setter)}
                    inlineEditingExpense={inlineEditingExpense}
                    inlineAddingParent={inlineAddingParent}
                    setInlineEditingExpense={setInlineEditingExpense}
                    setInlineAddingParent={setInlineAddingParent}
                  />
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onEdit={editExpense}
      />
    </div>
  );
}

export default ExpensesManagementTab;