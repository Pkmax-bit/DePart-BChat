import React from 'react';
import { DollarSign, Plus, Edit, Trash2, X, Save, Building2 } from 'lucide-react';

const CostManagement = ({
  selectedProject,
  projectExpenses,
  setProjectExpenses,
  showCostForm,
  setShowCostForm,
  editingExpense,
  setEditingExpense,
  costForm,
  setCostForm,
  expenseCategories,
  availableParents,
  saveProjectExpense,
  deleteProjectExpense,
  editProjectExpense,
  renderHierarchicalExpenses
}) => {
  return (
    <div className="space-y-6">
      {/* Cost Management Section */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Quản lý chi phí dự án
            </h3>
            <button
              onClick={() => setShowCostForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm chi phí</span>
            </button>
          </div>

          {/* Cost Form Modal */}
          {showCostForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingExpense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCostForm(false);
                        setEditingExpense(null);
                        setCostForm({
                          id_lcp: '',
                          giathanh: '',
                          mo_ta: '',
                          status: 'dự toán',
                          parent_id: '',
                          created_at: new Date().toISOString().split('T')[0]
                        });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    saveProjectExpense();
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại chi phí *</label>
                        <select
                          value={costForm.id_lcp}
                          onChange={(e) => setCostForm({...costForm, id_lcp: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                          required
                        >
                          <option value="">Chọn loại chi phí</option>
                          {expenseCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.tenchiphi}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={costForm.giathanh}
                          onChange={(e) => setCostForm({...costForm, giathanh: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                          placeholder="Nhập số tiền"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày chi phí</label>
                        <input
                          type="date"
                          value={costForm.created_at}
                          onChange={(e) => setCostForm({...costForm, created_at: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chi phí cha</label>
                        <select
                          value={costForm.parent_id}
                          onChange={(e) => setCostForm({...costForm, parent_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                          <option value="">Không có chi phí cha</option>
                          {availableParents.map(parent => (
                            <option key={parent.id} value={parent.id}>
                              {parent.mo_ta || 'N/A'} - {(parent.giathanh || 0).toLocaleString('vi-VN')} VND
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                      <input
                        type="text"
                        value={costForm.mo_ta}
                        onChange={(e) => setCostForm({...costForm, mo_ta: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        placeholder="Nhập mô tả chi phí"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                      <input
                        type="text"
                        value="dự toán"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
                        readOnly
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCostForm(false);
                          setEditingExpense(null);
                          setCostForm({
                            id_lcp: '',
                            giathanh: '',
                            mo_ta: '',
                            status: 'dự toán',
                            parent_id: '',
                            created_at: new Date().toISOString().split('T')[0]
                          });
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {editingExpense ? 'Cập nhật' : 'Thêm chi phí'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Project Expenses List */}
          <div className="space-y-4">
            {projectExpenses.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Chưa có chi phí nào cho dự án này</p>
                <p className="text-gray-400 text-sm mt-1">Thêm chi phí đầu tiên để theo dõi</p>
              </div>
            ) : (
              renderHierarchicalExpenses(projectExpenses)
            )}
          </div>

          {/* Cost Summary */}
          {projectExpenses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Tổng chi phí dự án</h4>
                  <p className="text-sm text-gray-600">
                    {projectExpenses.length} khoản chi phí
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {projectExpenses.reduce((sum, expense) => sum + (expense.giathanh || 0), 0).toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CostManagement;