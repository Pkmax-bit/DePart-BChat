import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Receipt, DollarSign, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  const exportToExcel = async (exportType = 'hierarchy') => {
    let exportData = [];
    let fileName = '';

    if (exportType === 'current') {
      // Export current month hierarchy data from database
      try {
        const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/hierarchy/?month=${selectedMonth}`);
        if (response.ok) {
          const data = await response.json();
          const hierarchyData = data.hierarchy || [];

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
          const exportDataTemp = flattenHierarchy(hierarchyData, '', null, totalRootAmount);

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
          exportDataTemp.push({
            'STT': 'TỔNG',
            'Tên chi phí': '',
            'Loại chi phí': '',
            'Số tiền': totalAmount,
            'Tỉ lệ': `${totalPercentage.toFixed(1)}%`,
            'Cấp bậc': '',
            'Ngày': ''
          });

          exportData = exportDataTemp;
          fileName = `chi_phi_thang_${selectedMonth}.xlsx`;
        } else {
          alert('Không thể tải dữ liệu chi phí từ database');
          return;
        }
      } catch (error) {
        console.error('Error loading hierarchy data:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu từ database');
        return;
      }
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
    } else if (exportType === 'hierarchy') {
      // Export hierarchical tree structure
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
      const exportDataTemp = flattenHierarchy(hierarchyData, '', null, totalRootAmount);

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
      exportDataTemp.push({
        'STT': 'TỔNG',
        'Tên chi phí': '',
        'Loại chi phí': '',
        'Số tiền': totalAmount,
        'Tỉ lệ': `${totalPercentage.toFixed(1)}%`,
        'Cấp bậc': '',
        'Ngày': ''
      });

      exportData = exportDataTemp;
      fileName = `chi_phi_cau_truc_cay_${selectedMonth}.xlsx`;
    }

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
              <BarChart3 className="w-6 h-6 text-red-600" />
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
          <BarChart data={[{ month: selectedMonth, expenses: totalExpenses }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

export default ExpensesOverviewTab;