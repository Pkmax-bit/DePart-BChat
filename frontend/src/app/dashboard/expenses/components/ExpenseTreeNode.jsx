import { useState } from 'react';
import { Receipt, Edit, Trash2, Plus, X } from 'lucide-react';
import InlineExpenseForm from './InlineExpenseForm';

function ExpenseTreeNode({
  expense,
  level = 0,
  parentAmount = null,
  parentName = null,
  totalRootAmount = null,
  expandedNodes,
  toggleNode,
  onInlineEdit,
  onInlineAdd,
  onDelete,
  onInlineSubmit,
  expenseCategories,
  availableParents,
  onCategoryCreateStart,
  inlineEditingExpense,
  inlineAddingParent,
  setInlineEditingExpense,
  setInlineAddingParent
}) {
  const hasChildren = expense.children && expense.children.length > 0;
  const isExpanded = expandedNodes.has(expense.id);
  const indent = level * 24;
  const isInlineEditing = inlineEditingExpense === expense.id;
  const isInlineAdding = inlineAddingParent === expense.id;

  // Tính tỉ lệ phần trăm so với tổng chi phí gốc (để hiển thị tỷ lệ tích lũy từ root)
  let rootPercentage = null;
  if (expense.ti_le !== null && expense.ti_le !== undefined) {
    rootPercentage = expense.ti_le;
  } else if (totalRootAmount && totalRootAmount > 0) {
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
    <div>
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
              onClick={() => onInlineAdd(expense.id)}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Thêm chi phí con"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onInlineEdit(expense.id)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-lg transition-all duration-200"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(expense.id)}
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
              await onInlineSubmit(formData, false);
              setInlineAddingParent(null);
            }}
            onCancel={() => setInlineAddingParent(null)}
            expenseCategories={expenseCategories}
            availableParents={availableParents}
            onCategoryCreateStart={onCategoryCreateStart}
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
              await onInlineSubmit(formData, true);
              setInlineEditingExpense(null);
            }}
            onCancel={() => setInlineEditingExpense(null)}
            expenseCategories={expenseCategories}
            availableParents={availableParents}
            onCategoryCreateStart={onCategoryCreateStart}
          />
        </div>
      )}
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {expense.children.map(child => (
            <ExpenseTreeNode
              key={child.id}
              expense={child}
              level={level + 1}
              parentAmount={expense.giathanh || 0}
              parentName={expense.loaichiphi?.tenchiphi || expense.mo_ta || 'Chi phí cha'}
              totalRootAmount={totalRootAmount}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onInlineEdit={onInlineEdit}
              onInlineAdd={onInlineAdd}
              onDelete={onDelete}
              onInlineSubmit={onInlineSubmit}
              expenseCategories={expenseCategories}
              availableParents={availableParents}
              onCategoryCreateStart={onCategoryCreateStart}
              inlineEditingExpense={inlineEditingExpense}
              inlineAddingParent={inlineAddingParent}
              setInlineEditingExpense={setInlineEditingExpense}
              setInlineAddingParent={setInlineAddingParent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseTreeNode;