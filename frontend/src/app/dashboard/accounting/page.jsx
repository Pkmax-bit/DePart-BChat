'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AccountingLayout from '../../../components/AccountingLayout';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Package, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings } from 'lucide-react';

const supabase = createClientComponentClient();

export default function AccountingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for demonstration
  const [salesData, setSalesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        await loadData();
      }
    };
    getUser();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [productsRes, categoriesRes, salesRes, expensesRes, reportsRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/accounting/products', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/expense-categories', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/sales', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/expenses', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/reports', { headers })
      ]);

      const products = await productsRes.json();
      const categories = await categoriesRes.json();
      const sales = await salesRes.json();
      const expenses = await expensesRes.json();
      const reports = await reportsRes.json();

      setProducts(products.products || []);
      setExpenseCategories(categories.categories || []);
      setSalesData(sales.sales || []);
      setExpensesData(expenses.expenses || []);
      setReportsData(reports.reports || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Load mock data if API fails
      loadMockData();
    }
  };

  const loadMockData = () => {
    setProducts([
      { id: 1, name: 'Sản phẩm A', unit_price: 150, cost_price: 70 },
      { id: 2, name: 'Dịch vụ B', unit_price: 500, cost_price: 200 }
    ]);
    setExpenseCategories([
      { id: 1, name: 'Tiền thuê nhà', type: 'fixed' },
      { id: 2, name: 'Lương nhân viên', type: 'fixed' },
      { id: 3, name: 'Chi phí Marketing', type: 'variable' },
      { id: 4, name: 'Nguyên vật liệu', type: 'variable' }
    ]);
    setSalesData([
      { id: 1, product_id: 1, quantity: 10, price_at_transaction: 150, total_revenue: 1500, transaction_date: '2023-09-01' },
      { id: 2, product_id: 2, quantity: 2, price_at_transaction: 500, total_revenue: 1000, transaction_date: '2023-09-05' }
    ]);
    setExpensesData([
      { id: 1, category_id: 1, amount: 5000, expense_date: '2023-09-01', description: 'Thuê nhà tháng 9' },
      { id: 2, category_id: 2, amount: 10000, expense_date: '2023-09-01', description: 'Lương nhân viên' }
    ]);
    setReportsData([
      { id: 1, report_month: '2023-09-01', total_revenue: 2500, total_expense: 15000, profit: -12500 },
      { id: 2, report_month: '2023-08-01', total_revenue: 3000, total_expense: 14000, profit: -11000 }
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <AccountingLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardTab reportsData={reportsData} salesData={salesData} expensesData={expensesData} />}
      {activeTab === 'revenue' && <RevenueTab salesData={salesData} products={products} setSalesData={setSalesData} />}
      {activeTab === 'expenses' && <ExpensesTab expensesData={expensesData} expenseCategories={expenseCategories} setExpensesData={setExpensesData} />}
      {activeTab === 'products' && <ProductsTab products={products} setProducts={setProducts} />}
      {activeTab === 'categories' && <ExpenseCategoriesTab expenseCategories={expenseCategories} setExpenseCategories={setExpenseCategories} />}
      {activeTab === 'generate' && <GenerateReportTab reportsData={reportsData} setReportsData={setReportsData} />}
      {activeTab === 'history' && <HistoryTab reportsData={reportsData} />}
    </AccountingLayout>
  );
}

function DashboardTab({ reportsData, salesData, expensesData }) {
  const totalRevenue = reportsData.reduce((sum, report) => sum + (report.total_revenue || 0), 0);
  const totalExpenses = reportsData.reduce((sum, report) => sum + (report.total_expense || 0), 0);
  const totalProfit = reportsData.reduce((sum, report) => sum + (report.profit || 0), 0);

  const chartData = reportsData.map(report => ({
    month: new Date(report.report_month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
    revenue: report.total_revenue || 0,
    expense: report.total_expense || 0,
    profit: report.profit || 0
  }));

  const pieData = [
    { name: 'Doanh thu', value: totalRevenue, color: '#10B981' },
    { name: 'Chi phí', value: totalExpenses, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng Chi phí</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lợi nhuận</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit.toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ lợi nhuận theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), '']} />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Doanh thu" />
              <Bar dataKey="expense" fill="#EF4444" name="Chi phí" />
              <Bar dataKey="profit" fill="#3B82F6" name="Lợi nhuận" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ Doanh thu vs Chi phí</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch gần đây</h3>
        <div className="space-y-4">
          {[...salesData.slice(0, 3), ...expensesData.slice(0, 3)].sort((a, b) =>
            new Date(b.transaction_date || b.expense_date) - new Date(a.transaction_date || a.expense_date)
          ).slice(0, 5).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${transaction.total_revenue ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.total_revenue ? <Receipt className="w-4 h-4 text-green-600" /> : <CreditCard className="w-4 h-4 text-red-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.total_revenue ? 'Doanh thu' : 'Chi phí'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.transaction_date || transaction.expense_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.total_revenue ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.total_revenue ? '+' : '-'}{(transaction.total_revenue || transaction.amount).toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueTab({ salesData, products, setSalesData }) {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    price_at_transaction: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:8001/api/v1/accounting/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          product_id: parseInt(formData.product_id),
          quantity: parseInt(formData.quantity),
          price_at_transaction: parseFloat(formData.price_at_transaction),
          transaction_date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSalesData([...salesData, result.sale]);
        setFormData({ product_id: '', quantity: '', price_at_transaction: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Doanh thu</h2>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý các giao dịch bán hàng</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
            <p className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString('vi-VN')} VND</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giao dịch</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm giao dịch bán hàng</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                <input
                  type="number"
                  placeholder="Nhập số lượng"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đơn giá (VND)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Nhập đơn giá"
                  value={formData.price_at_transaction}
                  onChange={(e) => setFormData({...formData, price_at_transaction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm giao dịch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách giao dịch</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {products.find(p => p.id == sale.product_id)?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.price_at_transaction.toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {sale.total_revenue.toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.transaction_date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {salesData.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có giao dịch nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpensesTab({ expensesData, expenseCategories, setExpensesData }) {
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:8001/api/v1/accounting/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          category_id: parseInt(formData.category_id),
          amount: parseFloat(formData.amount),
          description: formData.description,
          expense_date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExpensesData([...expensesData, result.expense]);
        setFormData({ category_id: '', amount: '', description: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Chi phí</h2>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý các khoản chi phí</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng chi phí</p>
            <p className="text-xl font-bold text-red-600">{totalExpenses.toLocaleString('vi-VN')} VND</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm chi phí</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm khoản chi phí</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Nhập số tiền"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <input
                  type="text"
                  placeholder="Nhập mô tả chi phí"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Thêm chi phí
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách chi phí</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expensesData.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {expenseCategories.find(c => c.id == expense.category_id)?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {expense.amount.toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.expense_date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expensesData.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có khoản chi phí nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsTab({ products, setProducts }) {
  const [formData, setFormData] = useState({
    name: '',
    unit_price: '',
    cost_price: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = editingProduct 
        ? `http://localhost:8001/api/v1/accounting/products/${editingProduct.id}`
        : 'http://localhost:8001/api/v1/accounting/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: formData.name,
          unit_price: parseFloat(formData.unit_price),
          cost_price: parseFloat(formData.cost_price)
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? result.product : p));
        } else {
          setProducts([...products, result.product]);
        }
        setFormData({ name: '', unit_price: '', cost_price: '' });
        setShowForm(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit_price: product.unit_price.toString(),
      cost_price: product.cost_price.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:8001/api/v1/accounting/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: '', unit_price: '', cost_price: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h2>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa sản phẩm và quản lý giá cả</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng sản phẩm</p>
            <p className="text-xl font-bold text-blue-600">{products.length}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán (VND)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Nhập giá bán"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá vốn (VND)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Nhập giá vốn"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lợi nhuận dự kiến</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-green-600">
                    {formData.unit_price && formData.cost_price ? 
                      (parseFloat(formData.unit_price) - parseFloat(formData.cost_price)).toLocaleString('vi-VN') : '0'} VND
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách sản phẩm</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá vốn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lợi nhuận</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => {
                const profit = product.unit_price - product.cost_price;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {product.unit_price.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.cost_price.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {profit.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có sản phẩm nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm sản phẩm đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseCategoriesTab({ expenseCategories, setExpenseCategories }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'variable'
  });
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const url = editingCategory 
        ? `http://localhost:8001/api/v1/accounting/expense-categories/${editingCategory.id}`
        : 'http://localhost:8001/api/v1/accounting/expense-categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (editingCategory) {
          setExpenseCategories(expenseCategories.map(c => c.id === editingCategory.id ? result.category : c));
        } else {
          setExpenseCategories([...expenseCategories, result.category]);
        }
        setFormData({ name: '', type: 'variable' });
        setShowForm(false);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:8001/api/v1/accounting/expense-categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        setExpenseCategories(expenseCategories.filter(c => c.id !== categoryId));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', type: 'variable' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Danh mục Chi phí</h2>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa danh mục chi phí</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng danh mục</p>
            <p className="text-xl font-bold text-purple-600">{expenseCategories.length}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục</label>
                <input
                  type="text"
                  placeholder="Nhập tên danh mục"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại chi phí</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="fixed">Chi phí cố định</option>
                  <option value="variable">Chi phí biến động</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingCategory ? 'Cập nhật' : 'Thêm danh mục'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách danh mục</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại chi phí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenseCategories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      category.type === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {category.type === 'fixed' ? 'Cố định' : 'Biến động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenseCategories.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có danh mục nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm danh mục đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GenerateReportTab({ reportsData, setReportsData }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedMonth) {
      alert('Vui lòng chọn tháng để tạo báo cáo');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:8001/api/v1/accounting/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ month: selectedMonth })
      });

      if (response.ok) {
        const result = await response.json();
        setReportsData([result.report, ...reportsData]);
        alert('Báo cáo đã được tạo thành công!');
        setSelectedMonth('');
      } else {
        alert('Có lỗi xảy ra khi tạo báo cáo');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Có lỗi xảy ra khi tạo báo cáo');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tạo Báo cáo</h2>
        <p className="text-gray-600 mt-1">Tạo báo cáo lợi nhuận hàng tháng tự động</p>
      </div>

      {/* Generate Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn tháng báo cáo</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="2020-01"
              max={new Date().toISOString().slice(0, 7)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedMonth}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Tạo Báo cáo</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Thông tin báo cáo</h4>
              <p className="text-sm text-blue-700 mt-1">
                Báo cáo sẽ tự động tính toán tổng doanh thu, tổng chi phí và lợi nhuận cho tháng đã chọn.
                Dữ liệu sẽ được lưu trữ và có thể xem lại bất cứ lúc nào.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ reportsData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Lịch sử Báo cáo</h2>
        <p className="text-gray-600 mt-1">Xem lại các báo cáo lợi nhuận đã tạo</p>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách báo cáo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lợi nhuận</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ suất</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.map(report => {
                const profitMargin = report.total_revenue > 0 ? ((report.profit / report.total_revenue) * 100).toFixed(1) : 0;
                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(report.report_month).toLocaleDateString('vi-VN', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {report.total_revenue.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {report.total_expense.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {report.profit >= 0 ? '+' : ''}{report.profit.toLocaleString('vi-VN')} VND
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        profitMargin >= 20 ? 'bg-green-100 text-green-800' :
                        profitMargin >= 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profitMargin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {reportsData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có báo cáo nào</p>
            <p className="text-sm text-gray-400 mt-1">Tạo báo cáo đầu tiên từ tab "Tạo Báo cáo"</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {reportsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-xl font-bold text-gray-900">
                  {reportsData.reduce((sum, r) => sum + r.total_revenue, 0).toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                <p className="text-xl font-bold text-gray-900">
                  {reportsData.reduce((sum, r) => sum + r.total_expense, 0).toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng lợi nhuận</p>
                <p className="text-xl font-bold text-gray-900">
                  {reportsData.reduce((sum, r) => sum + r.profit, 0).toLocaleString('vi-VN')} VND
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tỷ suất TB</p>
                <p className="text-xl font-bold text-gray-900">
                  {reportsData.length > 0 ?
                    ((reportsData.reduce((sum, r) => sum + r.profit, 0) /
                      reportsData.reduce((sum, r) => sum + r.total_revenue, 0)) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
