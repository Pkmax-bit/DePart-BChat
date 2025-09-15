import { RefreshCw, FileSpreadsheet, Printer } from 'lucide-react';

export default function ProfitControls({
  selectedPeriod,
  setSelectedPeriod,
  loadData,
  syncAllData,
  syncing,
  exportToExcel,
  exportToPDF
}) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn tháng</label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={syncAllData}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}</span>
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}