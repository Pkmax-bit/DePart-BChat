'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, FileText, Calendar, User, DollarSign, Building2, Eye, Edit, Trash2 } from 'lucide-react';

const supabase = createClientComponentClient();

export default function ProjectQuotesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
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
        setQuotes(quotesData || []);
      }

      // Load employees for display
      const employeesResponse = await fetch('/api/v1/payroll/employees');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Đơn hàng báo giá</h1>
                {project && (
                  <p className="text-gray-600 mt-1">
                    Công trình: <span className="font-semibold">{project.name_congtrinh}</span>
                    {project.name_customer && (
                      <> - Khách hàng: <span className="font-semibold">{project.name_customer}</span></>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Trực tuyến</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info Card */}
        {project && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Thông tin công trình</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên công trình</label>
                <p className="text-lg font-semibold text-gray-900">{project.name_congtrinh}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                <p className="text-gray-900">{project.name_customer}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nhân viên kinh doanh</label>
                <p className="text-gray-900">{getEmployeeName(project.Id_sale)}</p>
              </div>
              {project.sdt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <p className="text-gray-900">{project.sdt}</p>
                </div>
              )}
              {project.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{project.email}</p>
                </div>
              )}
              {project.ngan_sach_du_kien && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngân sách dự kiến</label>
                  <p className="text-green-600 font-semibold">{formatCurrency(project.ngan_sach_du_kien)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotes List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Danh sách đơn hàng báo giá ({quotes.length})
                </h2>
              </div>
              <button
                onClick={() => router.push('/dashboard/quote')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Tạo đơn hàng mới</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {quotes.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Chưa có đơn hàng báo giá nào</p>
                <p className="text-gray-400 text-sm mt-1">Hãy tạo đơn hàng báo giá đầu tiên cho công trình này</p>
                <button
                  onClick={() => router.push('/dashboard/quote')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tạo đơn hàng mới
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Đơn hàng #{quote.id}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
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
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(quote.total_amount)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Tổng tiền
                        </div>
                      </div>
                    </div>

                    {/* Quote Items Summary */}
                    {quote.items && quote.items.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Chi tiết sản phẩm:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {quote.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                              {item.loai_san_pham === 'tu_bep' ? (
                                <span>
                                  {item.id_bophan} - {formatCurrency(item.thanh_tien)}
                                </span>
                              ) : (
                                <span>
                                  Phụ kiện: {formatCurrency(item.thanh_tien)}
                                </span>
                              )}
                            </div>
                          ))}
                          {quote.items.length > 3 && (
                            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                              +{quote.items.length - 3} sản phẩm khác
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        {quote.items ? `${quote.items.length} sản phẩm` : '0 sản phẩm'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/quote?quoteId=${quote.id}`)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/quote?editQuoteId=${quote.id}`)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Chỉnh sửa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}