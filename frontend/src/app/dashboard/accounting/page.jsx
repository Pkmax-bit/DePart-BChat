'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Package, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings, RotateCcw, Save, RefreshCw, Download, Users, Wrench, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';

const supabase = createClientComponentClient();

function AccountingLayout({ user, activeTab, onTabChange, children }) {
  const tabs = [
    { id: 'revenue', label: 'Doanh thu', icon: TrendingUp },
    { id: 'invoices', label: 'Hóa đơn', icon: FileText },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'materials', label: 'Vật liệu', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài chính</h1>
              <p className="text-gray-600 mt-1">Quản lý hóa đơn và theo dõi doanh thu</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

export default function AccountingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailForm, setProductDetailForm] = useState({
    id_nhom: '',
    id_kinh: '',
    id_taynam: '',
    id_bophan: '',
    ngang: 0,
    cao: 0,
    sau: 0,
    don_gia: 0
  });
  const [activeTab, setActiveTab] = useState('revenue');

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
      {activeTab === 'revenue' && <RevenueTab salesData={salesData} products={products} setSalesData={setSalesData} />}
      {activeTab === 'invoices' && <InvoicesTab />}
      {activeTab === 'products' && <ProductsManagementTab products={products} setProducts={setProducts} />}
      {activeTab === 'materials' && <MaterialsManagementTab />}
    </AccountingLayout>
  );
}

function InvoicesTab() {
  const [sanphamList, setSanphamList] = useState([]);
  const [chitietsanphamList, setChitietsanphamList] = useState([]);
  const [loainhomList, setLoainhomList] = useState([]);
  const [loaikinhList, setLoaikinhList] = useState([]);
  const [loaitaynamList, setLoaitaynamList] = useState([]);
  const [bophanList, setBophanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBophans, setSelectedBophans] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceTime, setInvoiceTime] = useState(new Date().toTimeString().split(' ')[0]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [globalNhom, setGlobalNhom] = useState('');
  const [globalKinh, setGlobalKinh] = useState('');
  const [globalTaynam, setGlobalTaynam] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sanphamRes, chitietsanphamRes, loainhomRes, loaikinhRes, loaitaynamRes, bophanRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/sanpham/'),
        fetch('http://localhost:8001/api/v1/chitietsanpham/'),
        fetch('http://localhost:8001/api/v1/loainhom/'),
        fetch('http://localhost:8001/api/v1/loaikinh/'),
        fetch('http://localhost:8001/api/v1/loaitaynam/'),
        fetch('http://localhost:8001/api/v1/bophan/')
      ]);

      if (sanphamRes.ok) setSanphamList(await sanphamRes.json());
      if (chitietsanphamRes.ok) setChitietsanphamList(await chitietsanphamRes.json());
      if (loainhomRes.ok) setLoainhomList(await loainhomRes.json());
      if (loaikinhRes.ok) setLoaikinhList(await loaikinhRes.json());
      if (loaitaynamRes.ok) setLoaitaynamList(await loaitaynamRes.json());
      if (bophanRes.ok) setBophanList(await bophanRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInvoiceItem = () => {
    const newItem = {
      id: Date.now(),
      id_nhom: '',
      id_kinh: '',
      id_taynam: '',
      id_bophan: '',
      sanpham: null,
      ngang: 0,
      cao: 0,
      sau: 0,
      so_luong: 1,
      don_gia: 0,
      dien_tich_ke_hoach: 0,
      dien_tich_thuc_te: 0,
      ti_le: 0,
      thanh_tien: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeInvoiceItem = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const toggleBophan = (bophanId) => {
    setSelectedBophans(prev => {
      if (prev.includes(bophanId)) {
        return prev.filter(id => id !== bophanId);
      } else {
        return [...prev, bophanId];
      }
    });
  };

  const applyGlobalSelections = () => {
    if (selectedBophans.length === 0) {
      alert('Vui lòng chọn ít nhất một bộ phận trước khi áp dụng');
      return;
    }

    setInvoiceItems(prevItems => {
      const updatedItems = [...prevItems];
      
      selectedBophans.forEach(bophanId => {
        let item = updatedItems.find(item => item.id_bophan === bophanId);
        
        if (!item) {
          // Tạo item mới nếu chưa có
          item = {
            id: bophanId,
            id_nhom: globalNhom,
            id_kinh: globalKinh,
            id_taynam: globalTaynam,
            id_bophan: bophanId,
            sanpham: null,
            ngang: 0,
            cao: 0,
            sau: 0,
            so_luong: 1,
            don_gia: 0,
            dien_tich_ke_hoach: 0,
            dien_tich_thuc_te: 0,
            ti_le: 0,
            thanh_tien: 0
          };
          updatedItems.push(item);
        } else {
          // Cập nhật item hiện có
          item.id_nhom = globalNhom;
          item.id_kinh = globalKinh;
          item.id_taynam = globalTaynam;
        }

        // Tự động tìm sản phẩm và cập nhật thông tin
        if (item.id_nhom && item.id_kinh && item.id_taynam && item.id_bophan) {
          const foundSanpham = sanphamList.find(sp => 
            sp.id_nhom === item.id_nhom && 
            sp.id_kinh === item.id_kinh && 
            sp.id_taynam === item.id_taynam && 
            sp.id_bophan === item.id_bophan
          );
          
          if (foundSanpham) {
            item.sanpham = foundSanpham;
            const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === foundSanpham.id);
            if (foundDetail) {
              const isSpecialDepartment = item.id_bophan === 'TN' || item.id_bophan === 'MC' || item.id_bophan === 'TL';
              const minSize = isSpecialDepartment ? 1 : 300;
              const maxSize = item.id_bophan === 'TL' ? 1000 : 900;
              
              item.ngang = foundDetail.ngang;
              item.cao = Math.max(minSize, Math.min(maxSize, foundDetail.cao));
              item.sau = Math.max(minSize, Math.min(maxSize, foundDetail.sau));
              item.don_gia = foundDetail.don_gia;
              item.dien_tich_ke_hoach = (foundDetail.ngang * foundDetail.cao + foundDetail.ngang * foundDetail.sau + foundDetail.cao * foundDetail.sau) * 2;
              
              const dien_tich_thuc_te = (item.ngang * item.cao + item.ngang * item.sau + item.cao * item.sau) * 2;
              item.dien_tich_thuc_te = dien_tich_thuc_te;
              item.ti_le = item.dien_tich_ke_hoach > 0 ? (dien_tich_thuc_te / item.dien_tich_ke_hoach) : 0;
              item.thanh_tien = item.ti_le * item.don_gia * item.so_luong;
            }
          } else {
            item.sanpham = null;
            item.ngang = 0;
            item.cao = 0;
            item.sau = 0;
            item.don_gia = 0;
            item.dien_tich_ke_hoach = 0;
            item.dien_tich_thuc_te = 0;
            item.ti_le = 0;
            item.thanh_tien = 0;
          }
        }
      });

      return updatedItems;
    });
  };

  const loadBophanData = (bophanId) => {
    setInvoiceItems(prevItems => {
      const updatedItems = [...prevItems];
      let item = updatedItems.find(item => item.id_bophan === bophanId);
      
      if (!item) {
        // Tạo item mới nếu chưa có
        item = {
          id: bophanId,
          id_nhom: globalNhom,
          id_kinh: globalKinh,
          id_taynam: globalTaynam,
          id_bophan: bophanId,
          sanpham: null,
          ngang: 0,
          cao: 0,
          sau: 0,
          so_luong: 1,
          don_gia: 0,
          dien_tich_ke_hoach: 0,
          dien_tich_thuc_te: 0,
          ti_le: 0,
          thanh_tien: 0
        };
        updatedItems.push(item);
      }
      // Không reset lại id_nhom, id_kinh, id_taynam - giữ nguyên giá trị hiện tại

      // Tự động tìm sản phẩm và cập nhật thông tin với các lựa chọn hiện tại
      if (item.id_nhom && item.id_kinh && item.id_taynam && item.id_bophan) {
        const foundSanpham = sanphamList.find(sp => 
          sp.id_nhom === item.id_nhom && 
          sp.id_kinh === item.id_kinh && 
          sp.id_taynam === item.id_taynam && 
          sp.id_bophan === item.id_bophan
        );
        
        if (foundSanpham) {
          item.sanpham = foundSanpham;
          const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === foundSanpham.id);
          if (foundDetail) {
            const isSpecialDepartment = item.id_bophan === 'TN' || item.id_bophan === 'MC' || item.id_bophan === 'TL';
            const minSize = isSpecialDepartment ? 1 : 300;
            const maxSize = item.id_bophan === 'TL' ? 1000 : 900;
            
            item.ngang = foundDetail.ngang;
            item.cao = Math.max(minSize, Math.min(maxSize, foundDetail.cao));
            item.sau = Math.max(minSize, Math.min(maxSize, foundDetail.sau));
            item.don_gia = foundDetail.don_gia;
            item.dien_tich_ke_hoach = (foundDetail.ngang * foundDetail.cao + foundDetail.ngang * foundDetail.sau + foundDetail.cao * foundDetail.sau) * 2;
            
            const dien_tich_thuc_te = (item.ngang * item.cao + item.ngang * item.sau + item.cao * item.sau) * 2;
            item.dien_tich_thuc_te = dien_tich_thuc_te;
            item.ti_le = item.dien_tich_ke_hoach > 0 ? (dien_tich_thuc_te / item.dien_tich_ke_hoach) : 0;
            item.thanh_tien = item.ti_le * item.don_gia * item.so_luong;
          }
        } else {
          item.sanpham = null;
          item.ngang = 0;
          item.cao = 0;
          item.sau = 0;
          item.don_gia = 0;
          item.dien_tich_ke_hoach = 0;
          item.dien_tich_thuc_te = 0;
          item.ti_le = 0;
          item.thanh_tien = 0;
        }
      }

      return updatedItems;
    });
  };

  const getSelectedBophansData = () => {
    return bophanList.filter(bophan => selectedBophans.includes(bophan.id));
  };

  const resetDimensions = (id) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id && item.sanpham) {
        const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === item.sanpham.id);
        if (foundDetail) {
          const updatedItem = { ...item };
          // Cho phép bộ phận "Tầng nhôm" (TN) và "Mặc cánh" (MC) có kích thước nhỏ hơn 300mm
          const isSpecialDepartment = item.id_bophan === 'TN' || item.id_bophan === 'MC'|| item.id_bophan === 'TL';
          const minSize = isSpecialDepartment ? 1 : 300;
          const maxSize = item.id_bophan === 'TL' ? 1000 : 900;
          
          updatedItem.cao = Math.max(minSize, Math.min(maxSize, foundDetail.cao));
          updatedItem.sau = Math.max(minSize, Math.min(maxSize, foundDetail.sau));
          calculateInvoiceItem(updatedItem);
          return updatedItem;
        }
      }
      return item;
    }));
  };

  const updateInvoiceItem = (id, field, value) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Khi chọn các loại, tìm sản phẩm tương ứng
        if (['id_nhom', 'id_kinh', 'id_taynam', 'id_bophan'].includes(field)) {
          // Nếu có bất kỳ loại nào được chọn rỗng, reset sản phẩm và các giá trị liên quan
          const currentNhom = field === 'id_nhom' ? value : (updatedItem.id_nhom || globalNhom);
          const currentKinh = field === 'id_kinh' ? value : (updatedItem.id_kinh || globalKinh);
          const currentTaynam = field === 'id_taynam' ? value : (updatedItem.id_taynam || globalTaynam);
          const currentBophan = field === 'id_bophan' ? value : updatedItem.id_bophan;

          if (!currentNhom || !currentKinh || !currentTaynam || !currentBophan) {
            updatedItem.sanpham = null;
            updatedItem.ngang = 0;
            updatedItem.cao = 0;
            updatedItem.sau = 0;
            updatedItem.don_gia = 0;
            updatedItem.dien_tich_ke_hoach = 0;
            updatedItem.dien_tich_thuc_te = 0;
            updatedItem.ti_le = 0;
            updatedItem.thanh_tien = 0;
            calculateInvoiceItem(updatedItem);
          } else {
            // Nếu tất cả các loại đã được chọn, tìm sản phẩm
            const foundSanpham = sanphamList.find(sp => 
              sp.id_nhom === currentNhom && 
              sp.id_kinh === currentKinh && 
              sp.id_taynam === currentTaynam && 
              sp.id_bophan === currentBophan
            );
            if (foundSanpham) {
              updatedItem.sanpham = foundSanpham;
              // Tìm chi tiết sản phẩm
              const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === foundSanpham.id);
              if (foundDetail) {
                updatedItem.ngang = foundDetail.ngang;
                // Cho phép bộ phận "Tầng nhôm" (TN) và "Mặc cánh" (MC) có kích thước nhỏ hơn 300mm
                const isSpecialDepartment = updatedItem.id_bophan === 'TN' || updatedItem.id_bophan === 'MC' || updatedItem.id_bophan === 'TL';
                const minSize = isSpecialDepartment ? 1 : 300;
                const maxSize = updatedItem.id_bophan === 'TL' ? 1000 : 900;
                
                updatedItem.cao = Math.max(minSize, Math.min(maxSize, foundDetail.cao));
                updatedItem.sau = Math.max(minSize, Math.min(maxSize, foundDetail.sau));
                updatedItem.don_gia = foundDetail.don_gia;
                // Tính diện tích kế hoạch với kích thước gốc
                updatedItem.dien_tich_ke_hoach = (foundDetail.ngang * foundDetail.cao + foundDetail.ngang * foundDetail.sau + foundDetail.cao * foundDetail.sau) * 2;
                // Tính lại diện tích thực tế và thành tiền
                calculateInvoiceItem(updatedItem);
              }
            } else {
              // Nếu không tìm thấy sản phẩm phù hợp, reset các giá trị
              updatedItem.sanpham = null;
              updatedItem.ngang = 0;
              updatedItem.cao = 0;
              updatedItem.sau = 0;
              updatedItem.don_gia = 0;
              updatedItem.dien_tich_ke_hoach = 0;
              updatedItem.dien_tich_thuc_te = 0;
              updatedItem.ti_le = 0;
              updatedItem.thanh_tien = 0;
              calculateInvoiceItem(updatedItem);
            }
          }
        }
        
        // Tính toán khi thay đổi kích thước hoặc số lượng
        if (['cao', 'sau'].includes(field)) {
          // Cho phép bộ phận "Tầng nhôm" (TN), "Mặc cánh" (MC) và "Tủ lạnh" (TL) có kích thước nhỏ hơn 300mm
          const isSpecialDepartment = updatedItem.id_bophan === 'TN' || updatedItem.id_bophan === 'MC' || updatedItem.id_bophan === 'TL';
          const minSize = isSpecialDepartment ? 1 : 300;
          const maxSize = updatedItem.id_bophan === 'TL' ? 1000 : 900;
          const value = Math.max(minSize, Math.min(maxSize, updatedItem[field]));
          updatedItem[field] = value;
          calculateInvoiceItem(updatedItem);
        }
        if (field === 'so_luong') {
          calculateInvoiceItem(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateInvoiceItem = (item) => {
    const ngang = item.ngang || 0;
    const cao = item.cao || 0;
    const sau = item.sau || 0;
    const dien_tich_ke_hoach = item.dien_tich_ke_hoach || 0;
    
    // Diện tích thực tế với kích thước điều chỉnh
    const dien_tich_thuc_te = (ngang * cao + ngang * sau + cao * sau) * 2;
    
    // Tỉ lệ
    const ti_le = dien_tich_ke_hoach > 0 ? (dien_tich_thuc_te / dien_tich_ke_hoach) : 0;
    
    // Thành tiền
    const thanh_tien = ti_le * (item.don_gia || 0) * (item.so_luong || 1);
    
    item.dien_tich_thuc_te = dien_tich_thuc_te;
    item.ti_le = ti_le;
    item.thanh_tien = thanh_tien;
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);
  };

  const saveInvoice = async () => {
    if (!customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }
    
    if (invoiceItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    // Kiểm tra xem các bộ phận được chọn có đầy đủ các loại (nhôm, kính, tay nắm) không
    const invalidItems = invoiceItems.filter(item => 
      selectedBophans.includes(item.id_bophan) && (
        !(item.id_nhom || globalNhom) || !(item.id_kinh || globalKinh) || !(item.id_taynam || globalTaynam) || !item.id_bophan || !item.sanpham
      )
    );

    if (invalidItems.length > 0) {
      alert('Vui lòng chọn đầy đủ các loại (nhôm, kính, tay nắm) cho tất cả bộ phận đã tích chọn');
      return;
    }

    try {
      const invoiceData = {
        customer_name: customerName,
        invoice_date: `${invoiceDate}T${invoiceTime}`,
        items: invoiceItems.map(item => ({
          id_nhom: item.id_nhom,
          id_kinh: item.id_kinh,
          id_taynam: item.id_taynam,
          id_bophan: item.id_bophan,
          sanpham_id: item.sanpham?.id,
          ngang: item.ngang,
          cao: item.cao,
          sau: item.sau,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
          dien_tich_ke_hoach: item.dien_tich_ke_hoach,
          dien_tich_thuc_te: item.dien_tich_thuc_te,
          ti_le: item.ti_le,
          thanh_tien: item.thanh_tien
        })),
        total_amount: calculateTotal()
      };

      const response = await fetch('http://localhost:8001/api/v1/invoices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        alert('Hóa đơn đã được lưu thành công!');
        // Reset form
        setCustomerName('');
        setInvoiceItems([]);
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setInvoiceTime(new Date().toTimeString().split(' ')[0]);
        // Reload trang
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra khi lưu hóa đơn: ${errorData.detail || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Có lỗi xảy ra khi lưu hóa đơn');
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Hóa đơn</h2>
          <p className="text-gray-600 mt-1">Tạo và quản lý hóa đơn sản phẩm</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="text-xl font-bold text-green-600">{calculateTotal().toLocaleString('vi-VN')} VND</p>
          </div>
          <button
            onClick={saveInvoice}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Lưu Hóa đơn</span>
          </button>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hóa đơn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hóa đơn</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giờ hóa đơn</label>
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

      {/* Invoice Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết sản phẩm</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={addInvoiceItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hóa đơn sản phẩm</span>
            </button>
            <button
              onClick={addInvoiceItem}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center w-10 h-10"
              title="Thêm sản phẩm nhanh"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        </div>

        {/* Chọn bộ phận */}  
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Chọn bộ phận cần sản xuất:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {bophanList.map(bophan => (
              <label key={bophan.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBophans.includes(bophan.id)}
                  onChange={() => toggleBophan(bophan.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">{bophan.tenloai}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Chọn loại vật liệu chung */}
        {selectedBophans.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Chọn loại vật liệu chung</h4>
              <button
                onClick={applyGlobalSelections}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Áp dụng cho tất cả bộ phận</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhôm chung</label>
                <select
                  value={globalNhom}
                  onChange={(e) => setGlobalNhom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                >
                  <option value="">Chọn loại nhôm</option>
                  {loainhomList.map(nhom => (
                    <option key={nhom.id} value={nhom.id}>{nhom.tenloai}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại kính chung</label>
                <select
                  value={globalKinh}
                  onChange={(e) => setGlobalKinh(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                >
                  <option value="">Chọn loại kính</option>
                  {loaikinhList.map(kinh => (
                    <option key={kinh.id} value={kinh.id}>{kinh.tenloai}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại tay nắm chung</label>
                <select
                  value={globalTaynam}
                  onChange={(e) => setGlobalTaynam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                >
                  <option value="">Chọn loại tay nắm</option>
                  {loaitaynamList.map(taynam => (
                    <option key={taynam.id} value={taynam.id}>{taynam.tenloai}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Chọn các loại vật liệu ở trên và nhấn "Áp dụng cho tất cả bộ phận" để tự động điền vào tất cả các bộ phận đã chọn.
                Điều này giúp tiết kiệm thời gian và tránh phải chọn lại cho từng bộ phận.
              </p>
            </div>
          </div>
        )}

        {/* Form chi tiết cho các bộ phận được chọn */}
        {selectedBophans.length > 0 && (
          <div className="space-y-4">
            {selectedBophans.map((bophanId, index) => {
              const bophan = bophanList.find(b => b.id === bophanId);
              const item = invoiceItems.find(item => item.id_bophan === bophanId) || {
                id: bophanId,
                id_nhom: '',
                id_kinh: '',
                id_taynam: '',
                id_bophan: bophanId,
                sanpham: null,
                ngang: 0,
                cao: 0,
                sau: 0,
                so_luong: 1,
                don_gia: 0,
                dien_tich_ke_hoach: 0,
                dien_tich_thuc_te: 0,
                ti_le: 0,
                thanh_tien: 0
              };

              return (
                <div key={bophanId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">{bophan.tenloai} - Sản phẩm {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadBophanData(bophanId)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Load lại dữ liệu bộ phận này"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleBophan(bophanId)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Bỏ chọn bộ phận này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhôm</label>
                      <select
                        value={item.id_nhom || globalNhom}
                        onChange={(e) => updateInvoiceItem(item.id, 'id_nhom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
                        required
                      >
                        <option value="">Chọn loại nhôm</option>
                        {loainhomList.map(nhom => (
                          <option key={nhom.id} value={nhom.id}>{nhom.tenloai}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại kính</label>
                      <select
                        value={item.id_kinh || globalKinh}
                        onChange={(e) => updateInvoiceItem(item.id, 'id_kinh', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
                        required
                      >
                        <option value="">Chọn loại kính</option>
                        {loaikinhList.map(kinh => (
                          <option key={kinh.id} value={kinh.id}>{kinh.tenloai}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại tay nắm</label>
                      <select
                        value={item.id_taynam || globalTaynam}
                        onChange={(e) => updateInvoiceItem(item.id, 'id_taynam', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
                        required
                      >
                        <option value="">Chọn loại tay nắm</option>
                        {loaitaynamList.map(taynam => (
                          <option key={taynam.id} value={taynam.id}>{taynam.tenloai}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bộ phận</label>
                      <input
                        type="text"
                        value={bophan.tenloai}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                    <input
                      type="text"
                      value={item.sanpham ? item.sanpham.tensp : ''}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                        !(item.id_nhom || globalNhom) || !(item.id_kinh || globalKinh) || !(item.id_taynam || globalTaynam) 
                          ? 'bg-red-50 text-red-700' 
                          : 'bg-white text-black'
                      }`}
                      readOnly
                      placeholder={
                        !(item.id_nhom || globalNhom) || !(item.id_kinh || globalKinh) || !(item.id_taynam || globalTaynam) 
                          ? "Vui lòng chọn đầy đủ các loại (nhôm, kính, tay nắm)" 
                          : "Sản phẩm sẽ được tự động chọn khi chọn đủ các loại"
                      }
                    />
                    {(!(item.id_nhom || globalNhom) || !(item.id_kinh || globalKinh) || !(item.id_taynam || globalTaynam)) && (
                      <p className="text-red-500 text-xs mt-1">⚠️ Chưa chọn đầy đủ các loại</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chiều ngang (mm)</label>
                      <input
                        type="number"
                        value={item.ngang}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                        placeholder="Cố định"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chiều cao (mm)</label>
                      <input
                        type="number"
                        min={item.id_bophan === 'TN' || item.id_bophan === 'MC' || item.id_bophan === 'TL' ? "1" : "300"}
                        max={item.id_bophan === 'TL' ? "1000" : "900"}
                        value={item.cao}
                        onChange={(e) => {
                          const isSpecialDepartment = item.id_bophan === 'TN' || item.id_bophan === 'MC' || item.id_bophan === 'TL';
                          const minSize = isSpecialDepartment ? 1 : 300;
                          const maxSize = item.id_bophan === 'TL' ? 1000 : 900;
                          const value = Math.max(minSize, Math.min(maxSize, parseInt(e.target.value) || minSize));
                          updateInvoiceItem(item.id, 'cao', value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-100 text-black"
                        placeholder={item.id_bophan === 'TN' || item.id_bophan === 'MC'|| item.id_bophan === 'TL' ? "1-1000" : "300-900"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chiều sâu (mm)</label>
                      <input
                        type="number"
                        min={item.id_bophan === 'TN' || item.id_bophan === 'MC' || item.id_bophan === 'TL'? "1" : "300"}
                        max={item.id_bophan === 'TL' ? "1000" : "900"}
                        value={item.sau}
                        onChange={(e) => {
                          const isSpecialDepartment = item.id_bophan === 'TN' || item.id_bophan === 'MC'|| item.id_bophan === 'TL';
                          const minSize = isSpecialDepartment ? 1 : 300;
                          const maxSize = item.id_bophan === 'TL' ? 1000 : 900;
                          const value = Math.max(minSize, Math.min(maxSize, parseInt(e.target.value) || minSize));
                          updateInvoiceItem(item.id, 'sau', value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-100 text-black"
                        placeholder={item.id_bophan === 'TN' || item.id_bophan === 'MC'|| item.id_bophan === 'TL' ? "1-1000" : "300-900"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={item.so_luong}
                        onChange={(e) => updateInvoiceItem(item.id, 'so_luong', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-100 text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đơn giá (VND)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.don_gia}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích kế hoạch (mm²)</label>
                      <input
                        type="number"
                        value={item.dien_tich_ke_hoach}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích thực tế (mm²)</label>
                      <input
                        type="number"
                        value={item.dien_tich_thuc_te}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉ lệ (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={(item.ti_le * 100).toFixed(2)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉ lệ (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={(item.ti_le * 100).toFixed(2)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thành tiền (VND)</label>
                      <input
                        type="text"
                        value={`${item.thanh_tien.toLocaleString('vi-VN')} VND`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-700 font-semibold"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedBophans.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có bộ phận nào được chọn</p>
            <p className="text-sm text-gray-400 mt-1">Hãy tích chọn các bộ phận cần sản xuất ở trên</p>
          </div>
        )}

        {/* Summary Section */}
        {selectedBophans.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-4">
              {selectedBophans.map(bophanId => {
                const bophan = bophanList.find(b => b.id === bophanId);
                if (!bophan) return null;

                // Find the invoice item for this department
                const item = invoiceItems.find(item => item.id_bophan === bophanId);
                if (!item || !item.sanpham) return null;

                const totalPrice = item.thanh_tien || 0;

                return (
                  <div key={bophanId} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.sanpham.tensp}</h4>
                        <p className="text-sm text-gray-600">Bộ phận: {bophan.tenloai}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {totalPrice.toLocaleString('vi-VN')} VND
                        </p>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.so_luong || 0}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Diện tích kế hoạch:</span>
                        <p className="font-medium">{(item.dien_tich_ke_hoach || 0).toLocaleString('vi-VN')} mm²</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Diện tích thực tế:</span>
                        <p className="font-medium">{(item.dien_tich_thuc_te || 0).toLocaleString('vi-VN')} mm²</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tỉ lệ:</span>
                        <p className="font-medium">{(item.ti_le * 100 || 0).toFixed(2)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Đơn giá:</span>
                        <p className="font-medium">{(item.don_gia || 0).toLocaleString('vi-VN')} VND</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Tổng cộng</h4>
                  <p className="text-sm text-gray-600">
                    {selectedBophans.length} bộ phận • {invoiceItems.reduce((sum, item) => sum + (item.so_luong || 0), 0)} sản phẩm
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {calculateTotal().toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveInvoice}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Lưu đơn hàng</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
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
  const [invoices, setInvoices] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [selectedMonth]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      console.log('Loading invoices for month:', selectedMonth);

      const response = await fetch(`http://localhost:8001/api/v1/invoices?month=${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Invoices loaded successfully:', data);
        setInvoices(data.invoices || []);
      } else {
        const errorText = await response.text();
        console.error('Error loading invoices:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        alert(`Không thể tải danh sách hóa đơn: ${response.status} ${response.statusText}`);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Network error loading invoices:', error);
      alert('Lỗi kết nối mạng. Vui lòng kiểm tra backend server.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn - ${invoice.customer_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-info { margin-bottom: 20px; }
            .invoice-info div { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN</h1>
            <h2>Công ty TNHH Nội Thất ABC</h2>
          </div>
          
          <div class="invoice-info">
            <div><strong>Tên khách hàng:</strong> ${invoice.customer_name}</div>
            <div><strong>Ngày hóa đơn:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}</div>
            <div><strong>Giờ:</strong> ${new Date(invoice.invoice_date).toLocaleTimeString('vi-VN')}</div>
          </div>
          
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Loại nhôm</th>
                    <th>Loại kính</th>
                    <th>Loại tay nắm</th>
                    <th>Bộ phận</th>
                    <th>Kích thước</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.sanpham?.tensp || 'N/A'}</td>
                      <td>${item.sanpham?.ten_nhom || item.ten_nhom || 'N/A'}</td>
                      <td>${item.sanpham?.ten_kinh || item.ten_kinh || 'N/A'}</td>
                      <td>${item.sanpham?.ten_taynam || item.ten_taynam || 'N/A'}</td>
                      <td>${item.sanpham?.ten_bophan || item.ten_bophan || 'N/A'}</td>
                      <td>${item.ngang} x ${item.cao} x ${item.sau} mm</td>
                      <td>${item.so_luong}</td>
                      <td>${item.don_gia?.toLocaleString('vi-VN')} VND</td>
                      <td>${item.thanh_tien?.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>          <div class="total">
            <div>Tổng tiền: ${invoice.total_amount?.toLocaleString('vi-VN')} VND</div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const printAllInvoices = () => {
    if (invoices.length === 0) {
      alert('Không có hóa đơn nào để in');
      return;
    }

    const printWindow = window.open('', '_blank');
    const allInvoicesHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Danh sách hóa đơn tháng ${selectedMonth}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice { page-break-after: always; margin-bottom: 40px; }
            .invoice-info { margin-bottom: 20px; }
            .invoice-info div { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .month-total { font-size: 20px; font-weight: bold; text-align: center; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DANH SÁCH HÓA ĐƠN</h1>
            <h2>Tháng ${selectedMonth}</h2>
          </div>
          
          ${invoices.map(invoice => `
            <div class="invoice">
              <div class="invoice-info">
                <div><strong>Tên khách hàng:</strong> ${invoice.customer_name}</div>
                <div><strong>Ngày hóa đơn:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}</div>
                <div><strong>Giờ:</strong> ${new Date(invoice.invoice_date).toLocaleTimeString('vi-VN')}</div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Loại nhôm</th>
                    <th>Loại kính</th>
                    <th>Loại tay nắm</th>
                    <th>Bộ phận</th>
                    <th>Kích thước</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.sanpham?.tensp || 'N/A'}</td>
                      <td>${item.sanpham?.ten_nhom || item.ten_nhom || 'N/A'}</td>
                      <td>${item.sanpham?.ten_kinh || item.ten_kinh || 'N/A'}</td>
                      <td>${item.sanpham?.ten_taynam || item.ten_taynam || 'N/A'}</td>
                      <td>${item.sanpham?.ten_bophan || item.ten_bophan || 'N/A'}</td>
                      <td>${item.ngang} x ${item.cao} x ${item.sau} mm</td>
                      <td>${item.so_luong}</td>
                      <td>${item.don_gia?.toLocaleString('vi-VN')} VND</td>
                      <td>${item.thanh_tien?.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total">
                <div>Tổng tiền: ${invoice.total_amount?.toLocaleString('vi-VN')} VND</div>
              </div>
            </div>
          `).join('')}
          
          <div class="month-total">
            Tổng doanh thu tháng ${selectedMonth}: ${invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toLocaleString('vi-VN')} VND
          </div>
          
          <div class="footer">
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(allInvoicesHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = () => {
    if (invoices.length === 0) {
      alert('Không có hóa đơn nào để xuất');
      return;
    }

    // Tạo dữ liệu cho Excel
    const excelData = [];
    
    // Header
    excelData.push(['DANH SÁCH HÓA ĐƠN THÁNG ' + selectedMonth]);
    excelData.push([]);
    excelData.push(['STT', 'Khách hàng', 'Ngày', 'Giờ', 'Tên sản phẩm', 'Loại nhôm', 'Loại kính', 'Loại tay nắm', 'Bộ phận', 'Kích thước', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Tổng hóa đơn']);

    let rowIndex = 4; // Bắt đầu từ dòng 4 (index 3)
    
    invoices.forEach((invoice, invoiceIndex) => {
      const invoiceDate = new Date(invoice.invoice_date);
      const dateStr = invoiceDate.toLocaleDateString('vi-VN');
      const timeStr = invoiceDate.toLocaleTimeString('vi-VN');
      
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item, itemIndex) => {
          excelData.push([
            invoiceIndex + 1, // STT hóa đơn
            invoice.customer_name,
            dateStr,
            timeStr,
            item.sanpham?.tensp || 'N/A',
            item.sanpham?.ten_nhom || item.ten_nhom || 'N/A',
            item.sanpham?.ten_kinh || item.ten_kinh || 'N/A',
            item.sanpham?.ten_taynam || item.ten_taynam || 'N/A',
            item.sanpham?.ten_bophan || item.ten_bophan || 'N/A',
            `${item.ngang} x ${item.cao} x ${item.sau} mm`,
            item.so_luong,
            item.don_gia || 0,
            item.thanh_tien || 0,
            itemIndex === 0 ? invoice.total_amount || 0 : '' // Chỉ hiển thị tổng ở dòng đầu của mỗi hóa đơn
          ]);
        });
      } else {
        // Nếu không có items, vẫn thêm dòng cho hóa đơn
        excelData.push([
          invoiceIndex + 1,
          invoice.customer_name,
          dateStr,
          timeStr,
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          'N/A',
          0,
          0,
          0,
          invoice.total_amount || 0
        ]);
      }
      
      // Thêm dòng trống giữa các hóa đơn
      excelData.push([]);
      rowIndex += (invoice.items?.length || 1) + 1;
    });

    // Thêm tổng kết tháng
    excelData.push([]);
    excelData.push(['', '', '', '', '', '', '', '', '', '', '', 'TỔNG DOANH THU THÁNG:', totalRevenue]);

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Định dạng cột với kích thước đồng bộ hơn
    const colWidths = [
      { wch: 6 },   // STT
      { wch: 25 },  // Khách hàng
      { wch: 12 },  // Ngày
      { wch: 10 },  // Giờ
      { wch: 30 },  // Tên sản phẩm
      { wch: 20 },  // Loại nhôm
      { wch: 20 },  // Loại kính
      { wch: 20 },  // Loại tay nắm
      { wch: 20 },  // Bộ phận
      { wch: 25 },  // Kích thước
      { wch: 12 },  // Số lượng
      { wch: 15 },  // Đơn giá
      { wch: 15 },  // Thành tiền
      { wch: 18 }   // Tổng hóa đơn
    ];
    ws['!cols'] = colWidths;

    // Thêm styling cho borders và header
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Tạo style cho header (dòng 3 - index 2)
    const headerRow = 2; // Dòng header (0-indexed)
    for (let col = 0; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        fill: { fgColor: { rgb: "000000" } }, // Background đen
        font: { color: { rgb: "FFFFFF" }, bold: true }, // Chữ trắng, in đậm
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Thêm borders cho tất cả các ô dữ liệu
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        // Bỏ qua styling cho dòng trống
        if (row === 1 || (row > 3 && excelData[row] && excelData[row].every(cell => cell === ''))) continue;
        
        // Nếu chưa có style, tạo mới
        if (!ws[cellAddress].s) {
          ws[cellAddress].s = {};
        }
        
        // Thêm borders
        ws[cellAddress].s.border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        };
        
        // Căn giữa cho các cột số
        if (col === 0 || col === 10 || col === 11 || col === 12 || col === 13) {
          ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
        } else {
          ws[cellAddress].s.alignment = { horizontal: "left", vertical: "center" };
        }
      }
    }

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'HoaDon_Thang_' + selectedMonth);

    // Xuất file
    const fileName = `DanhSach_HoaDon_Thang_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trung bình/đơn</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.length > 0 ? (totalRevenue / invoices.length).toLocaleString('vi-VN') : 0} VND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector & Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn tháng</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadInvoices}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToExcel}
              disabled={invoices.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={printAllInvoices}
              disabled={invoices.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>In tất cả</span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách hóa đơn tháng {selectedMonth}</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có hóa đơn nào trong tháng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{invoice.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {invoice.total_amount?.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => printInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="In hóa đơn"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt tháng {selectedMonth}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
              <p className="text-sm text-gray-600">Tổng hóa đơn</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0)}</p>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{totalRevenue.toLocaleString('vi-VN')} VND</p>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
            </div>
          </div>
        </div>
      )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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

function ProductsManagementTab({ products, setProducts }) {
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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

function MaterialsManagementTab() {
  const [activeMaterialTab, setActiveMaterialTab] = useState('nhom');
  const [nhomList, setNhomList] = useState([]);
  const [kinhList, setKinhList] = useState([]);
  const [taynamList, setTaynamList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tenloai: '',
    mota: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Product detail modal states
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailForm, setProductDetailForm] = useState({
    id_nhom: '',
    id_kinh: '',
    id_taynam: '',
    id_bophan: '',
    ngang: 0,
    cao: 0,
    sau: 0,
    don_gia: 0
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const [nhomRes, kinhRes, taynamRes, bophanRes, productsRes, productDetailsRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/loainhom/'),
        fetch('http://localhost:8001/api/v1/loaikinh/'),
        fetch('http://localhost:8001/api/v1/loaitaynam/'),
        fetch('http://localhost:8001/api/v1/bophan/'),
        fetch('http://localhost:8001/api/v1/sanpham/'),
        fetch('http://localhost:8001/api/v1/chitietsanpham/')
      ]);

      if (nhomRes.ok) setNhomList(await nhomRes.json());
      if (kinhRes.ok) setKinhList(await kinhRes.json());
      if (taynamRes.ok) setTaynamList(await taynamRes.json());
      if (bophanRes.ok) setDepartments(await bophanRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (productDetailsRes.ok) setProductDetails(await productDetailsRes.json());
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentList = () => {
    switch (activeMaterialTab) {
      case 'nhom': return nhomList;
      case 'kinh': return kinhList;
      case 'taynam': return taynamList;
      case 'departments': return departments;
      case 'products': return products;
      default: return [];
    }
  };

  const getCurrentSetter = () => {
    switch (activeMaterialTab) {
      case 'nhom': return setNhomList;
      case 'kinh': return setKinhList;
      case 'taynam': return setTaynamList;
      case 'departments': return setDepartments;
      case 'products': return setProducts;
      default: return () => {};
    }
  };

  const getApiEndpoint = () => {
    switch (activeMaterialTab) {
      case 'nhom': return 'loainhom';
      case 'kinh': return 'loaikinh';
      case 'taynam': return 'loaitaynam';
      case 'departments': return 'bophan';
      case 'products': return 'sanpham';
      default: return '';
    }
  };

  const getMaterialTitle = () => {
    switch (activeMaterialTab) {
      case 'nhom': return 'Loại nhôm';
      case 'kinh': return 'Loại kính';
      case 'taynam': return 'Loại tay nắm';
      case 'departments': return 'Bộ phận';
      case 'products': return 'Sản phẩm';
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = getApiEndpoint();
      const url = editingItem 
        ? `http://localhost:8001/api/v1/${endpoint}/${editingItem.id}`
        : `http://localhost:8001/api/v1/${endpoint}/`;
      
      const method = editingItem ? 'PUT' : 'POST';

      let bodyData;
      if (activeMaterialTab === 'products') {
        bodyData = {
          tensp: formData.tensp,
          gia: formData.gia
        };
      } else {
        bodyData = {
          tenloai: formData.tenloai,
          mota: formData.mota
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (response.ok) {
        const result = await response.json();
        const setter = getCurrentSetter();
        const currentList = getCurrentList();
        
        if (editingItem) {
          setter(currentList.map(item => item.id === editingItem.id ? result : item));
        } else {
          setter([...currentList, result]);
        }
        
        setFormData({});
        setShowForm(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeMaterialTab === 'products') {
      setFormData({
        tensp: item.tensp || '',
        gia: item.gia || 0
      });
    } else {
      setFormData({
        tenloai: item.tenloai,
        mota: item.mota || ''
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;

    try {
      const endpoint = getApiEndpoint();
      const response = await fetch(`http://localhost:8001/api/v1/${endpoint}/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const setter = getCurrentSetter();
        const currentList = getCurrentList();
        setter(currentList.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    // Load product details for this product
    const productDetail = productDetails.find(detail => detail.id_sanpham === product.id);
    if (productDetail) {
      setProductDetailForm({
        id_nhom: productDetail.id_nhom || '',
        id_kinh: productDetail.id_kinh || '',
        id_taynam: productDetail.id_taynam || '',
        id_bophan: productDetail.id_bophan || '',
        ngang: productDetail.ngang || 0,
        cao: productDetail.cao || 0,
        sau: productDetail.sau || 0,
        don_gia: productDetail.don_gia || 0
      });
    } else {
      setProductDetailForm({
        id_nhom: '',
        id_kinh: '',
        id_taynam: '',
        id_bophan: '',
        ngang: 0,
        cao: 0,
        sau: 0,
        don_gia: 0
      });
    }
    setShowProductDetailModal(true);
  };

  const handleProductDetailSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:8001/api/v1/chitietsanpham/`;
      const method = 'POST'; // Always create new or update existing

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_sanpham: selectedProduct.id,
          id_nhom: productDetailForm.id_nhom,
          id_kinh: productDetailForm.id_kinh,
          id_taynam: productDetailForm.id_taynam,
          id_bophan: productDetailForm.id_bophan,
          ngang: productDetailForm.ngang,
          cao: productDetailForm.cao,
          sau: productDetailForm.sau,
          don_gia: productDetailForm.don_gia
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update product details in state
        const updatedDetails = productDetails.filter(detail => detail.id_sanpham !== selectedProduct.id);
        setProductDetails([...updatedDetails, result]);
        setShowProductDetailModal(false);
        setSelectedProduct(null);
        alert('Chi tiết sản phẩm đã được cập nhật thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật chi tiết sản phẩm');
      }
    } catch (error) {
      console.error('Error saving product detail:', error);
      alert('Có lỗi xảy ra khi cập nhật chi tiết sản phẩm');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu vật liệu...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Vật liệu</h2>
          <p className="text-gray-600 mt-1">Quản lý các loại nhôm, kính, tay nắm, bộ phận, sản phẩm và chi tiết sản phẩm</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng {getMaterialTitle().toLowerCase()}</p>
            <p className="text-xl font-bold text-purple-600">{getCurrentList().length}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm {getMaterialTitle().toLowerCase()}</span>
          </button>
          <button
            onClick={fetchMaterials}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* Material Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'nhom', label: 'Loại nhôm', count: nhomList.length },
              { id: 'kinh', label: 'Loại kính', count: kinhList.length },
              { id: 'taynam', label: 'Loại tay nắm', count: taynamList.length },
              { id: 'departments', label: 'Bộ phận', count: departments.length },
              { id: 'products', label: 'Sản phẩm', count: products.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMaterialTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeMaterialTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? `Chỉnh sửa ${getMaterialTitle().toLowerCase()}` : `Thêm ${getMaterialTitle().toLowerCase()} mới`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeMaterialTab === 'products' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm"
                      value={formData.tensp || ''}
                      onChange={(e) => setFormData({...formData, tensp: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VND)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Nhập giá sản phẩm"
                      value={formData.gia || ''}
                      onChange={(e) => setFormData({...formData, gia: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên loại</label>
                    <input
                      type="text"
                      placeholder={`Nhập tên ${getMaterialTitle().toLowerCase()}`}
                      value={formData.tenloai}
                      onChange={(e) => setFormData({...formData, tenloai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <input
                      type="text"
                      placeholder="Nhập mô tả (tùy chọn)"
                      value={formData.mota}
                      onChange={(e) => setFormData({...formData, mota: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              )}
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
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Materials List */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeMaterialTab === 'products' ? 'Tên sản phẩm' : 'Tên loại'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeMaterialTab === 'products' ? 'Giá (VND)' : 'Mô tả'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentList().map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 text-gray-400 mr-2" />
                        <span 
                          className={`text-sm font-medium text-gray-900 ${activeMaterialTab === 'products' ? 'cursor-pointer hover:text-blue-600' : ''}`}
                          onClick={() => activeMaterialTab === 'products' && handleProductClick(item)}
                        >
                          {activeMaterialTab === 'products' ? item.tensp : item.tenloai}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activeMaterialTab === 'products' ? 
                        (item.gia ? item.gia.toLocaleString('vi-VN') + ' VND' : 'Chưa có giá') :
                        (item.mota || 'Không có mô tả')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
        </div>

        {getCurrentList().length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có {getMaterialTitle().toLowerCase()} nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm {getMaterialTitle().toLowerCase()} đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chỉnh sửa chi tiết sản phẩm: {selectedProduct.tensp}
                </h3>
                <button
                  onClick={() => setShowProductDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleProductDetailSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhôm</label>
                    <select
                      value={productDetailForm.id_nhom}
                      onChange={(e) => setProductDetailForm({...productDetailForm, id_nhom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Chọn loại nhôm</option>
                      {nhomList.map(nhom => (
                        <option key={nhom.id} value={nhom.id}>{nhom.tenloai}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại kính</label>
                    <select
                      value={productDetailForm.id_kinh}
                      onChange={(e) => setProductDetailForm({...productDetailForm, id_kinh: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Chọn loại kính</option>
                      {kinhList.map(kinh => (
                        <option key={kinh.id} value={kinh.id}>{kinh.tenloai}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại tay nắm</label>
                    <select
                      value={productDetailForm.id_taynam}
                      onChange={(e) => setProductDetailForm({...productDetailForm, id_taynam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Chọn loại tay nắm</option>
                      {taynamList.map(taynam => (
                        <option key={taynam.id} value={taynam.id}>{taynam.tenloai}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bộ phận</label>
                    <select
                      value={productDetailForm.id_bophan}
                      onChange={(e) => setProductDetailForm({...productDetailForm, id_bophan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="">Chọn bộ phận</option>
                      {departments.map(bophan => (
                        <option key={bophan.id} value={bophan.id}>{bophan.tenloai}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chiều ngang (mm)</label>
                    <input
                      type="number"
                      min="1"
                      value={productDetailForm.ngang}
                      onChange={(e) => setProductDetailForm({...productDetailForm, ngang: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Nhập chiều ngang"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chiều cao (mm)</label>
                    <input
                      type="number"
                      min="1"
                      value={productDetailForm.cao}
                      onChange={(e) => setProductDetailForm({...productDetailForm, cao: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Nhập chiều cao"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chiều sâu (mm)</label>
                    <input
                      type="number"
                      min="1"
                      value={productDetailForm.sau}
                      onChange={(e) => setProductDetailForm({...productDetailForm, sau: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Nhập chiều sâu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đơn giá (VND)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productDetailForm.don_gia}
                    onChange={(e) => setProductDetailForm({...productDetailForm, don_gia: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập đơn giá"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowProductDetailModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Lưu chi tiết sản phẩm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại chi phí</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
