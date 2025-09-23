'use client';

import { useState, useEffect } from 'react';

const CurrencyInput = ({
  value,
  onChange,
  placeholder = "Nhập số tiền...",
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format số thành chuỗi có dấu phân cách hàng nghìn
  const formatCurrency = (num) => {
    if (!num || num === '') return '';
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = num.toString().replace(/[^\d]/g, '');
    // Format với dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Chuyển đổi chuỗi format về số
  const parseCurrency = (str) => {
    if (!str || str === '') return '';
    // Loại bỏ tất cả dấu chấm và chuyển về số
    return str.replace(/\./g, '');
  };

  // Cập nhật displayValue khi value thay đổi từ bên ngoài
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatCurrency(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Chỉ cho phép nhập số và dấu chấm
    if (!/^[0-9.]*$/.test(inputValue)) {
      return;
    }

    // Loại bỏ dấu chấm để kiểm tra
    const numericValue = inputValue.replace(/\./g, '');

    // Giới hạn độ dài (tối đa 15 chữ số)
    if (numericValue.length > 15) {
      return;
    }

    // Format lại giá trị
    const formattedValue = formatCurrency(numericValue);
    setDisplayValue(formattedValue);

    // Gọi onChange với giá trị số thực
    if (onChange) {
      const numericResult = numericValue === '' ? '' : parseInt(numericValue);
      onChange(numericResult);
    }
  };

  const handleFocus = (e) => {
    // Khi focus, di chuyển cursor về cuối
    setTimeout(() => {
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    }, 0);
  };

  const handleBlur = () => {
    // Format lại khi blur để đảm bảo đúng format
    if (displayValue) {
      const numericValue = parseCurrency(displayValue);
      const formattedValue = formatCurrency(numericValue);
      setDisplayValue(formattedValue);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 ${className}`}
        {...props}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
        VND
      </div>
    </div>
  );
};

export default CurrencyInput;
