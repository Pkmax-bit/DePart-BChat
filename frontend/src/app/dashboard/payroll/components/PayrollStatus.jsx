import { Award, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function PayrollStatus({ summaryStats, selectedPeriod }) {
  // Determine status based on payroll completion
  const completionRate = summaryStats.totalEmployees > 0
    ? ((summaryStats.totalPayrolls || 0) / summaryStats.totalEmployees) * 100
    : 0;

  const isComplete = completionRate >= 100;
  const isPartial = completionRate > 0 && completionRate < 100;
  const isEmpty = completionRate === 0;

  const getStatusConfig = () => {
    if (isComplete) {
      return {
        bgClass: 'bg-green-50 border border-green-200',
        iconBgClass: 'bg-green-100',
        icon: <CheckCircle className="w-6 h-6 text-green-600" />,
        title: 'HOÀN THÀNH',
        textColor: 'text-green-700',
        titleColor: 'text-green-900'
      };
    } else if (isPartial) {
      return {
        bgClass: 'bg-yellow-50 border border-yellow-200',
        iconBgClass: 'bg-yellow-100',
        icon: <Clock className="w-6 h-6 text-yellow-600" />,
        title: 'ĐANG XỬ LÝ',
        textColor: 'text-yellow-700',
        titleColor: 'text-yellow-900'
      };
    } else {
      return {
        bgClass: 'bg-red-50 border border-red-200',
        iconBgClass: 'bg-red-100',
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
        title: 'CHƯA XỬ LÝ',
        textColor: 'text-red-700',
        titleColor: 'text-red-900'
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`rounded-xl p-6 mb-8 ${statusConfig.bgClass}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${statusConfig.iconBgClass}`}>
          {statusConfig.icon}
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${statusConfig.titleColor}`}>
            {statusConfig.title}
          </h3>
          <p className={`text-sm ${statusConfig.textColor}`}>
            {isComplete
              ? `Đã hoàn thành tính lương cho ${summaryStats.totalEmployees} nhân viên trong tháng ${selectedPeriod}`
              : isPartial
              ? `Đã xử lý ${summaryStats.totalPayrolls || 0}/${summaryStats.totalEmployees} nhân viên (${completionRate.toFixed(1)}%) trong tháng ${selectedPeriod}`
              : `Chưa có dữ liệu lương cho tháng ${selectedPeriod}`
            }
          </p>
          {isPartial && (
            <p className="text-sm text-gray-600 mt-1">
              Còn {summaryStats.totalEmployees - (summaryStats.totalPayrolls || 0)} nhân viên chưa được tính lương
            </p>
          )}
        </div>
      </div>
    </div>
  );
}