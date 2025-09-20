import React from 'react';

const InvoiceInfo = ({
  customerName,
  setCustomerName,
  salesEmployee,
  setSalesEmployee,
  commissionPercentage,
  setCommissionPercentage,
  invoiceDate,
  setInvoiceDate,
  invoiceTime,
  setInvoiceTime,
  employees
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
            placeholder="Nhập tên khách hàng"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên bán hàng *</label>
          <select
            value={salesEmployee}
            onChange={(e) => setSalesEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
            required
          >
            <option value="">Chọn nhân viên bán hàng</option>
            {employees.map(employee => (
              <option key={employee.ma_nv} value={employee.ma_nv}>
                {employee.ho_ten} ({employee.ma_nv})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">% hoa hồng</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={commissionPercentage}
            onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-100 text-black"
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày đơn hàng</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giờ đơn hàng</label>
          <input
            type="time"
            value={invoiceTime}
            onChange={(e) => setInvoiceTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceInfo;