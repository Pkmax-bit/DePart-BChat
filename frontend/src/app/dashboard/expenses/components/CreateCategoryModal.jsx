import { useState } from 'react';
import { Plus, X, DollarSign } from 'lucide-react';

function CreateCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  success,
  newCategoryForm,
  setNewCategoryForm
}) {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
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
              onClick={onClose}
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
              <p className="text-sm font-medium">Tạo loại chi phí thành công!</p>
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

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    <span className="text-red-500 ml-1">*</span>
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
                      required={newCategoryForm.loaichiphi === 'định phí'}
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
                onClick={onClose}
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
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
                    Tạo loại chi phí
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCategoryModal;