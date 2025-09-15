import { Award, AlertTriangle } from 'lucide-react';

export default function ProfitStatus({ summaryStats, selectedPeriod }) {
  return (
    <div className={`rounded-xl p-6 mb-8 ${summaryStats.totalProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${summaryStats.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          {summaryStats.totalProfit >= 0 ? (
            <Award className="w-6 h-6 text-green-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${summaryStats.totalProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {summaryStats.totalProfit >= 0 ? 'LỢI NHUẬN' : 'LỖ'}
          </h3>
          <p className={`text-sm ${summaryStats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {summaryStats.totalProfit >= 0
              ? `Doanh nghiệp đang có lãi ${Math.abs(summaryStats.totalProfit).toLocaleString('vi-VN')} VND trong tháng ${selectedPeriod}`
              : `Doanh nghiệp đang lỗ ${Math.abs(summaryStats.totalProfit).toLocaleString('vi-VN')} VND trong tháng ${selectedPeriod}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}