'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, FileText, Calendar, User, DollarSign, Building2, Edit, Trash2, TrendingUp, Package, Receipt, BarChart3, Phone, Mail, MapPin, Info, ShoppingCart, Calculator, PieChart, ChevronDown, ChevronRight, Settings, Palette, Weight, Zap, Shield, Globe, Layers, Ruler, Tag } from 'lucide-react';

const supabase = createClientComponentClient();

export default function ProjectQuotesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId;

  // Validate projectId - redirect if not provided
  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy công trình</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng chọn một công trình cụ thể để xem chi tiết.
          </p>
          <button
            onClick={() => router.push('/dashboard/quote')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Quay lại danh sách công trình
          </button>
        </div>
      </div>
    );
  }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [costTree, setCostTree] = useState([]);
  const [userSession, setUserSession] = useState(null);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [costSearch, setCostSearch] = useState('');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Get user session for employee info
        const session = localStorage.getItem('userSession');
        if (session) {
          setUserSession(JSON.parse(session));
        }

        // Always load data regardless of user authentication status
        await loadData();
      } catch (error) {
        console.error('Error getting user:', error);
        // Still try to load data even if user auth fails
        await loadData();
      }
    };
    getUser();
  }, [projectId]);

  const loadData = async () => {
    try {
      // Load project info
      const projectResponse = await fetch(`http://localhost:8001/api/v1/quote/cong_trinh/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
      }

      // Load quotes for this project
      const quotesResponse = await fetch(`http://localhost:8001/api/v1/quote/invoices_quote/project/${projectId}`);
      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json();
        setQuotes(quotesData.quotes || []);
      }

      // Load cost tree for this project
      const costResponse = await fetch(`http://localhost:8001/api/v1/accounting/chiphi_quote/project/${projectId}`);
      if (costResponse.ok) {
        const costData = await costResponse.json();
        setCostTree(costData.expenses || []);
      }

      // Load employees for display
      const employeesResponse = await fetch('http://localhost:8001/api/v1/payroll/employees');
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return parseInt(amount).toLocaleString('vi-VN') + ' VND';
  };

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return 'N/A';
    const employee = employees.find(emp => emp.ma_nv === employeeId);
    return employee ? employee.ho_ten : employeeId;
  };

  // Tree view component for costs - handles hierarchical chiphi_quote structure
  const CostTreeNode = ({ cost, level = 0, searchTerm = '', parentName = null }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

    const matchesSearch = !searchTerm ||
      (cost.ten_chiphi && cost.ten_chiphi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cost.mo_ta && cost.mo_ta.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return null;

    const hasChildren = cost.children && cost.children.length > 0;
    const displayAmount = cost.total_amount || cost.giathanh || 0;

    return (
      <div className="relative">
        <div className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${level > 0 ? 'ml-6' : ''}`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Expand/Collapse button for parent nodes */}
                {hasChildren && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-green-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                )}

                {/* Indentation for child nodes */}
                {!hasChildren && level > 0 && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-px h-6 bg-gray-300"></div>
                  </div>
                )}

                <div className={`p-3 bg-gradient-to-br rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  level === 0
                    ? 'from-green-500 to-emerald-600'
                    : 'from-blue-500 to-indigo-600'
                }`}>
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-bold text-gray-900 group-hover:text-green-600 transition-colors text-lg`}>
                      {cost.ten_chiphi || `Chi phí #${cost.id}`}
                    </h4>
                    {hasChildren && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cost.children.length} mục con
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    {cost.created_at && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(cost.created_at)}</span>
                      </div>
                    )}
                    {level > 0 && parentName && (
                      <div className="flex items-center space-x-1">
                        <Layers className="w-4 h-4" />
                        <span>Thuộc: {parentName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold mb-1 text-2xl text-green-600`}>
                  {formatCurrency(displayAmount)}
                </div>
                {cost.total_amount && cost.total_amount !== cost.giathanh && (
                  <div className="text-sm text-gray-500">
                    Tổng: {formatCurrency(cost.total_amount)}
                  </div>
                )}
              </div>
            </div>

            {cost.mo_ta && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-800 leading-relaxed">
                  {cost.mo_ta}
                </p>
              </div>
            )}

            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="mt-6 space-y-4">
                <div className="border-l-2 border-green-200 pl-4 ml-6">
                  {cost.children.map((child) => (
                    <CostTreeNode
                      key={child.id}
                      cost={child}
                      level={level + 1}
                      searchTerm={searchTerm}
                      parentName={cost.ten_chiphi || `Chi phí #${cost.id}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filter quotes and costs
  const filteredQuotes = quotes.filter(quote => {
    const searchTerm = quoteSearch.toLowerCase();
    return (
      quote.id.toString().includes(searchTerm) ||
      (quote.customer_name && quote.customer_name.toLowerCase().includes(searchTerm)) ||
      (quote.invoice_date && quote.invoice_date.includes(searchTerm)) ||
      (quote.total_amount && quote.total_amount.toString().includes(searchTerm))
    );
  });

  const filteredCosts = costTree.filter(cost => {
    const searchTerm = costSearch.toLowerCase();
    return (
      (cost.ten_chiphi && cost.ten_chiphi.toLowerCase().includes(searchTerm)) ||
      (cost.mo_ta && cost.mo_ta.toLowerCase().includes(searchTerm))
    );
  });

  // Calculate statistics
  const totalQuotes = quotes.length;
  const totalProducts = quotes.reduce((sum, quote) => sum + (quote.items ? quote.items.length : 0), 0);
  const totalRevenue = quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);

  // Calculate total cost recursively from tree structure
  const calculateTotalCost = (costs) => {
    return costs.reduce((sum, cost) => {
      const costAmount = cost.total_amount || cost.giathanh || 0;
      const childrenSum = cost.children ? calculateTotalCost(cost.children) : 0;
      return sum + costAmount + childrenSum;
    }, 0);
  };
  const totalCost = calculateTotalCost(costTree);

  const profitMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-xl text-gray-700 font-medium">Đang tải dữ liệu công trình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Chi Tiết Công Trình
                </h1>
                {project && (
                  <p className="text-lg text-indigo-100">
                    {project.name_congtrinh}
                    {project.name_customer && (
                      <> - {project.name_customer}</>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-indigo-200">Xin chào</p>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-xl">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Trực tuyến</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-8 relative z-10">
        {/* Tab Content - All sections displayed together */}
        <div className="space-y-8">
          {/* Project Info Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Thông tin công trình</h3>
                  <p className="text-indigo-100 text-sm">Chi tiết và thông tin liên hệ</p>
                </div>
              </div>
            </div>

            {project && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tên công trình</label>
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <Building2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-lg font-bold text-blue-700">{project.name_congtrinh}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Khách hàng</label>
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span className="text-lg font-semibold text-purple-700">{project.name_customer}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nhân viên kinh doanh</label>
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <User className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-lg font-semibold text-green-700">{getEmployeeName(project.Id_sale)}</span>
                    </div>
                  </div>

                  {project.sdt && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Số điện thoại</label>
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span className="text-lg font-semibold text-orange-700">{project.sdt}</span>
                      </div>
                    </div>
                  )}

                  {project.email && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email</label>
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                        <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <span className="text-lg font-semibold text-indigo-700">{project.email}</span>
                      </div>
                    </div>
                  )}

                  {project.dia_chi && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Địa chỉ</label>
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                        <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="text-lg font-semibold text-gray-700">{project.dia_chi}</span>
                      </div>
                    </div>
                  )}

                  {project.ngan_sach_du_kien && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Ngân sách dự kiến</label>
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-lg font-bold text-green-700">{formatCurrency(project.ngan_sach_du_kien)}</span>
                      </div>
                    </div>
                  )}

                  {project.ngan_sach_ke_hoach && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Ngân sách kế hoạch</label>
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-lg font-bold text-blue-700">{formatCurrency(project.ngan_sach_ke_hoach)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {project.mo_ta && (
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Mô tả công trình</label>
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                      <p className="text-gray-700 leading-relaxed">{project.mo_ta}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Thông tin sản phẩm</h3>
                    <p className="text-blue-100 text-sm">Danh sách báo giá và sản phẩm</p>
                  </div>
                </div>
                <div className="text-white text-right">
                  <p className="text-sm opacity-90">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Tìm kiếm báo giá..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>

              {filteredQuotes.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="p-4 bg-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    Chưa có đơn hàng báo giá nào
                  </h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Hãy tạo đơn hàng báo giá đầu tiên cho công trình này để bắt đầu kinh doanh
                  </p>
                  <button
                    onClick={() => router.push('/dashboard/quote')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Tạo đơn hàng mới</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredQuotes.map((quote) => (
                    <div key={quote.id} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                Đơn hàng #{quote.id}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(quote.invoice_date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{getEmployeeName(quote.sales_employee_id)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              {formatCurrency(quote.total_amount)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Tổng giá trị
                            </div>
                          </div>
                        </div>

                        {/* Quote Items Summary */}
                        {quote.items && quote.items.length > 0 && (
                          <div className="mb-6">
                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết sản phẩm:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {quote.items.slice(0, 6).map((item, index) => (
                                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                                  <div className="text-sm space-y-2">
                                    {/* Tên sản phẩm */}
                                    <div className="font-medium text-blue-800 text-base truncate">
                                      {item.loai_san_pham === 'tu_bep' ? (
                                        <span>{item.ten_bophan || item.ten_sanpham || 'Tủ bếp'}</span>
                                      ) : (
                                        <span>{item.tenphukien || item.ten_sanpham || 'Phụ kiện'}</span>
                                      )}
                                    </div>

                                    {/* ID sản phẩm */}
                                    {item.id && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">ID:</span>
                                        <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">{item.id}</span>
                                      </div>
                                    )}

                                    {/* Tên sản phẩm từ bảng sanpham */}
                                    {item.tensp && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Tên SP:</span>
                                        <span className="font-medium text-blue-700">{item.tensp}</span>
                                      </div>
                                    )}

                                    {/* Thông tin chi tiết theo loại sản phẩm */}
                                    {item.loai_san_pham === 'tu_bep' ? (
                                      <>
                                        {/* Bộ phận */}
                                        {item.ten_bophan && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Bộ phận:</span>
                                            <span className="font-medium text-green-700">{item.ten_bophan}</span>
                                          </div>
                                        )}

                                        {/* Nhôm */}
                                        {item.ten_nhom && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Nhôm:</span>
                                            <span className="font-medium text-purple-700">{item.ten_nhom}</span>
                                          </div>
                                        )}

                                        {/* Kính */}
                                        {item.ten_kinh && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Kính:</span>
                                            <span className="font-medium text-indigo-700">{item.ten_kinh}</span>
                                          </div>
                                        )}

                                        {/* Tay nắm */}
                                        {item.ten_taynam && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Tay nắm:</span>
                                            <span className="font-medium text-pink-700">{item.ten_taynam}</span>
                                          </div>
                                        )}

                                        {/* Kích thước */}
                                        {item.ngang && item.cao && item.sau && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Kích thước:</span>
                                            <span className="font-medium text-orange-700">{item.ngang}×{item.cao}×{item.sau} cm</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {/* Phụ kiện */}
                                        {item.tenphukien && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Phụ kiện:</span>
                                            <span className="font-medium text-green-700">{item.tenphukien}</span>
                                          </div>
                                        )}

                                        {/* Thương hiệu */}
                                        {item.thuong_hieu && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Thương hiệu:</span>
                                            <span className="font-medium text-purple-700">{item.thuong_hieu}</span>
                                          </div>
                                        )}

                                        {/* Model */}
                                        {item.model && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Model:</span>
                                            <span className="font-medium text-indigo-700">{item.model}</span>
                                          </div>
                                        )}

                                        {/* Công suất */}
                                        {item.cong_suat && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Công suất:</span>
                                            <span className="font-medium text-pink-700">{item.cong_suat}</span>
                                          </div>
                                        )}

                                        {/* Kích thước */}
                                        {item.kich_thuoc && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Kích thước:</span>
                                            <span className="font-medium text-orange-700">{item.kich_thuoc}</span>
                                          </div>
                                        )}

                                        {/* Bảo hành */}
                                        {item.bao_hanh && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Bảo hành:</span>
                                            <span className="font-medium text-red-700">{item.bao_hanh}</span>
                                          </div>
                                        )}

                                        {/* Xuất xứ */}
                                        {item.xuat_xu && (
                                          <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Xuất xứ:</span>
                                            <span className="font-medium text-teal-700">{item.xuat_xu}</span>
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Thông tin chung */}
                                    {item.chat_lieu && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Chất liệu:</span>
                                        <span className="font-medium text-cyan-700">{item.chat_lieu}</span>
                                      </div>
                                    )}

                                    {item.mau_sac && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Màu sắc:</span>
                                        <span className="font-medium text-lime-700">{item.mau_sac}</span>
                                      </div>
                                    )}

                                    {item.trong_luong && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Trọng lượng:</span>
                                        <span className="font-medium text-amber-700">{item.trong_luong} kg</span>
                                      </div>
                                    )}

                                    {/* Thông tin thương mại */}
                                    <div className="border-t border-blue-200 pt-2 mt-2">
                                      <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                          <div className="text-xs text-gray-600">Đơn giá</div>
                                          <div className="font-semibold text-green-600">{formatCurrency(item.don_gia || 0)}</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-600">Số lượng</div>
                                          <div className="font-semibold text-blue-600">{item.so_luong || 1}</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-600">Thành tiền</div>
                                          <div className="font-bold text-purple-600">{formatCurrency(item.thanh_tien || 0)}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Mô tả */}
                                    {item.mo_ta && (
                                      <div className="mt-2 p-2 bg-white/50 rounded text-xs text-gray-700 italic">
                                        {item.mo_ta}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {quote.items.length > 6 && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-xl border border-gray-200 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    +{quote.items.length - 6} sản phẩm khác
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {quote.items ? `${quote.items.length} sản phẩm` : '0 sản phẩm'}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Hoàn thành
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => router.push(`/dashboard/quote?quoteId=${quote.id}`)}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2 border border-blue-200"
                            >
                              <span>Xem chi tiết</span>
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/quote?editQuoteId=${quote.id}`)}
                              className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center space-x-2 border border-green-200"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Chỉnh sửa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Costs Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Thông tin chi phí</h3>
                    <p className="text-green-100 text-sm">Danh sách các khoản chi phí</p>
                  </div>
                </div>
                <div className="text-white text-right">
                  <p className="text-sm opacity-90">Tổng chi phí</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Tìm kiếm chi phí..."
                  value={costSearch}
                  onChange={(e) => setCostSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                />
              </div>

              {costTree.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="p-4 bg-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Calculator className="w-10 h-10 text-gray-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">
                    Chưa có chi phí nào cho công trình này
                  </h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Hãy thêm các khoản chi phí đầu tiên cho công trình này để theo dõi chi phí hiệu quả
                  </p>
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Thêm chi phí mới
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCosts.map((cost) => (
                    <CostTreeNode
                      key={cost.id}
                      cost={cost}
                      level={0}
                      searchTerm={costSearch}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-8">
            {/* Project Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn hàng</p>
                      <p className="text-3xl font-bold text-gray-900">{totalQuotes}</p>
                      <div className="flex items-center mt-2">
                        <Receipt className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">Đơn hàng</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Receipt className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Tổng sản phẩm</p>
                      <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                      <div className="flex items-center mt-2">
                        <Package className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">Sản phẩm</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Tổng doanh thu</p>
                      <p className="text-3xl font-bold text-green-600">{totalRevenue.toLocaleString('vi-VN')}</p>
                      <div className="flex items-center mt-2">
                        <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">VND</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Lợi nhuận</p>
                      <p className="text-3xl font-bold text-purple-600">{profitMargin}%</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                        <span className="text-sm text-purple-600 font-medium">Biên lợi nhuận</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Tổng kết tài chính</h3>
                    <p className="text-purple-100 text-sm">Tóm tắt tổng thể về doanh thu và chi phí</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                      <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Tổng doanh thu</h4>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
                      <Calculator className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Tổng chi phí</h4>
                      <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`p-6 bg-gradient-to-br rounded-2xl border ${
                      totalRevenue - totalCost >= 0
                        ? 'from-blue-50 to-indigo-50 border-blue-200'
                        : 'from-red-50 to-pink-50 border-red-200'
                    }`}>
                      <TrendingUp className={`w-12 h-12 mx-auto mb-4 ${
                        totalRevenue - totalCost >= 0 ? 'text-blue-500' : 'text-red-500'
                      }`} />
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Lợi nhuận</h4>
                      <p className={`text-3xl font-bold ${
                        totalRevenue - totalCost >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(totalRevenue - totalCost)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Chi tiết tổng kết</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số đơn hàng:</span>
                        <span className="font-semibold text-gray-900">{totalQuotes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng sản phẩm:</span>
                        <span className="font-semibold text-gray-900">{totalProducts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Biên lợi nhuận:</span>
                        <span className="font-semibold text-purple-600">{profitMargin}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ngày cập nhật:</span>
                        <span className="font-semibold text-gray-900">{formatDate(new Date().toISOString())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}