'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ma_nv: '',
    thang: '',
    nam: '',
    so_luong_san_pham: '',
    don_gia_san_pham: '',
    ty_le: '',
    ghi_chu: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchEmployees();
  }, [selectedPeriod]);

  const fetchProducts = async () => {
    try {
      const [year, month] = selectedPeriod.split('-');
      const response = await fetch(`http://localhost:8001/api/v1/payroll/luong-san-pham/?thang=${month}&nam=${year}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // Fallback to all products if filtered request fails
        const fallbackResponse = await fetch('http://localhost:8001/api/v1/payroll/luong-san-pham/');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setProducts(data);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/payroll/employees/');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8001/api/v1/payroll/luong-san-pham/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thang: parseInt(formData.thang),
          nam: parseInt(formData.nam),
          so_luong_san_pham: parseInt(formData.so_luong_san_pham),
          don_gia_san_pham: parseFloat(formData.don_gia_san_pham),
          ty_le: parseFloat(formData.ty_le)
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          ma_nv: '',
          thang: '',
          nam: '',
          so_luong_san_pham: '',
          don_gia_san_pham: '',
          ty_le: '',
          ghi_chu: ''
        });
        fetchProducts();
      } else {
        const error = await response.json();
        alert(error.detail || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Có lỗi xảy ra khi tạo lương sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lương sản phẩm này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/payroll/luong-san-pham/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('Có lỗi xảy ra khi xóa lương sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa lương sản phẩm');
    }
  };

  const getEmployeeName = (ma_nv) => {
    const employee = employees.find(emp => emp.ma_nv === ma_nv);
    return employee ? employee.ho_ten : ma_nv;
  };

  const getEmployeeDepartment = (ma_nv) => {
    const employee = employees.find(emp => emp.ma_nv === ma_nv);
    return employee ? employee.phong_ban : 'N/A';
  };

  const calculateCommission = (so_luong, don_gia, ty_le) => {
    const total = (so_luong || 0) * (don_gia || 0);
    const commission = total * ((ty_le || 0) / 100);
    return commission.toLocaleString();
  };

  const calculateTotal = (so_luong, don_gia) => {
    const total = (so_luong || 0) * (don_gia || 0);
    return total.toLocaleString();
  };

  const filteredProducts = products.filter(product => {
    const [year, month] = selectedPeriod.split('-');
    const matchesPeriod = product.thang == parseInt(month) && product.nam == parseInt(year);
    const employeeName = getEmployeeName(product.ma_nv).toLowerCase();
    const employeeCode = product.ma_nv.toLowerCase();
    const periodString = `${product.thang}/${product.nam}`;
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) ||
                         employeeCode.includes(searchTerm.toLowerCase()) ||
                         periodString.includes(searchTerm);
    return matchesPeriod && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý lương sản phẩm</h1>
            <p className="mt-2 text-gray-600">Quản lý dữ liệu lương sản phẩm của nhân viên</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm lương sản phẩm
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tháng</label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchProducts();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Tải lại</span>
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Hiển thị {filteredProducts.length} bản ghi lương sản phẩm
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã NV hoặc tháng/năm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">{getEmployeeName(product.ma_nv)}</h3>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.ma_nv}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Phòng ban: {getEmployeeDepartment(product.ma_nv)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Tháng {product.thang}/{product.nam}
                        </div>
                        <div className="text-sm text-gray-500">
                          Số lượng: {product.so_luong_san_pham} | Đơn giá: {product.don_gia_san_pham ? product.don_gia_san_pham.toLocaleString() : '0'} VND
                        </div>
                        <div className="text-sm text-gray-500">
                          Tỉ lệ: {product.ty_le}% | Hoa hồng: {calculateCommission(product.so_luong_san_pham, product.don_gia_san_pham, product.ty_le)} VND
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          Tổng: {calculateTotal(product.so_luong_san_pham, product.don_gia_san_pham)} VND
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/payroll/products/${product.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lương sản phẩm</h3>
              <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm lương sản phẩm mới</p>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Thêm lương sản phẩm mới</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nhân viên *</label>
                    <select
                      required
                      value={formData.ma_nv}
                      onChange={(e) => setFormData({...formData, ma_nv: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Chọn nhân viên</option>
                      {employees.map(employee => (
                        <option key={employee.ma_nv} value={employee.ma_nv}>
                          {employee.ho_ten} ({employee.ma_nv})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tháng *</label>
                    <select
                      required
                      value={formData.thang}
                      onChange={(e) => setFormData({...formData, thang: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Chọn tháng</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Năm *</label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      value={formData.nam}
                      onChange={(e) => setFormData({...formData, nam: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số lượng sản phẩm *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.so_luong_san_pham}
                      onChange={(e) => setFormData({...formData, so_luong_san_pham: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Đơn giá sản phẩm *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.don_gia_san_pham}
                      onChange={(e) => setFormData({...formData, don_gia_san_pham: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tỉ lệ hoa hồng (%)*</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.ty_le}
                      onChange={(e) => setFormData({...formData, ty_le: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tổng tiền</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                      {formData.so_luong_san_pham && formData.don_gia_san_pham
                        ? (parseInt(formData.so_luong_san_pham) * parseFloat(formData.don_gia_san_pham)).toLocaleString()
                        : '0'} VND
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiền hoa hồng</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
                      {formData.so_luong_san_pham && formData.don_gia_san_pham && formData.ty_le
                        ? ((parseInt(formData.so_luong_san_pham) * parseFloat(formData.don_gia_san_pham) * parseFloat(formData.ty_le) / 100)).toLocaleString()
                        : '0'} VND
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                  <textarea
                    rows={3}
                    value={formData.ghi_chu}
                    onChange={(e) => setFormData({...formData, ghi_chu: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Thêm lương sản phẩm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}