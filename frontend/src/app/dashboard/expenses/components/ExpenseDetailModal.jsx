import { Eye, X, Receipt, FileText, DollarSign, Edit } from 'lucide-react';

function ExpenseDetailModal({ expense, onClose, onEdit }) {
  if (!expense) return null;

  return (
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
              onClick={onClose}
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
                      {expense.loaichiphi?.tenchiphi || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Loại:</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.mo_ta && expense.mo_ta.startsWith('Nhóm chi phí')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {expense.mo_ta && expense.mo_ta.startsWith('Nhóm chi phí') ? 'Nhóm chi phí' : 'Khoản chi phí'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-red-600 text-lg">
                      {(expense.giathanh || 0).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ngày chi phí:</span>
                    <span className="font-medium text-gray-900">
                      {expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Mô tả:</span>
                    <span className="font-medium text-gray-900 text-right max-w-xs">
                      {expense.mo_ta ? expense.mo_ta.replace(/^(Nhóm chi phí|Khoản chi phí):\s*/, '') : 'Không có mô tả'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Price Info */}
              {expense.loaichiphi?.loaichiphi === 'định phí' && expense.loaichiphi?.giathanh && (
                <div className="bg-blue-100 rounded-xl p-6 border border-blue-300">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Thông tin giá thành
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Giá thành định phí:</span>
                      <span className="font-bold text-blue-900">
                        {Number(expense.loaichiphi.giathanh).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Chi phí thực tế:</span>
                      <span className="font-bold text-blue-900">
                        {(expense.giathanh || 0).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="text-blue-700 font-medium">Chênh lệch:</span>
                      <span className={`font-bold ${
                        (expense.giathanh || 0) > (expense.loaichiphi.giathanh || 0)
                          ? 'text-red-600'
                          : (expense.giathanh || 0) < (expense.loaichiphi.giathanh || 0)
                            ? 'text-green-600'
                            : 'text-gray-600'
                      }`}>
                        {((expense.giathanh || 0) - (expense.loaichiphi.giathanh || 0)).toLocaleString('vi-VN')} VND
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

                {expense.hinhanh ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={expense.hinhanh}
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
                        href={expense.hinhanh}
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
                    onEdit(expense);
                    onClose();
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold"
                >
                  <div className="flex items-center justify-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </div>
                </button>
                <button
                  onClick={onClose}
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
  );
}

export default ExpenseDetailModal;