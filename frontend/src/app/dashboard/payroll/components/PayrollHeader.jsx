import { Calculator } from 'lucide-react';

export default function PayrollHeader({ user }) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calculator className="w-8 h-8 mr-3 text-blue-600" />
              Quản lý lương nhân viên
            </h1>
            <p className="text-gray-600 mt-1">Hệ thống tính lương tự động và quản lý nhân sự</p>
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
  );
}