import { useState, useEffect } from 'react';
import { Plus, X, DollarSign, Calendar } from 'lucide-react';

function InlineExpenseForm({ expense, parentId, onSubmit, onCancel, expenseCategories, availableParents = [], onCategoryCreateStart }) {
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
                // Note: This would need to be handled by parent component
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
}

export default InlineExpenseForm;