import { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Settings, X } from 'lucide-react';

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

export default ExpenseCategoriesTab;