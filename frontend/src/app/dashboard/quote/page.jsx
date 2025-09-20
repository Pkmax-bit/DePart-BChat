'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Package, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings, RotateCcw, Save, RefreshCw, Download, Users, Wrench, Eye, EyeOff, X, Check, Building2, Phone, Mail, MapPin, User, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const supabase = createClientComponentClient();

function QuoteLayout({ user, activeTab, onTabChange, children }) {
  const tabs = [
    { id: 'revenue', label: 'Báo giá', icon: TrendingUp },
    { id: 'invoices', label: 'Đơn hàng', icon: FileText },
    { id: 'expenses', label: 'Chi phí', icon: DollarSign },
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
              <h1 className="text-3xl font-bold text-gray-900">Báo giá Đơn hàng</h1>
              <p className="text-gray-600 mt-1">Tạo và quản lý đơn hàng báo giá</p>
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



export default function QuotePage() {
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
        fetch('http://localhost:8001/api/v1/accounting/loaichiphi', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/sales', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi', { headers }),
        fetch('http://localhost:8001/api/v1/accounting/reports', { headers })
      ]);

      const products = await productsRes.json();
      const categories = await categoriesRes.json();
      const sales = await salesRes.json();
      const expenses = await expensesRes.json();
      const reports = await reportsRes.json();

      setProducts(products.products || []);
      setExpenseCategories(categories || []);
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
    <QuoteLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'revenue' && <QuotesTab salesData={salesData} products={products} setSalesData={setSalesData} />}
      {activeTab === 'expenses' && <ExpensesManagementTab />}
      {activeTab === 'invoices' && <InvoicesTab />}
      {activeTab === 'products' && <ProductsManagementTab products={products} setProducts={setProducts} />}
      {activeTab === 'materials' && <MaterialsManagementTab />}
    </QuoteLayout>
  );
}

function InvoicesTab() {
  const router = useRouter();
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
  const [salesEmployee, setSalesEmployee] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(5);
  const [employees, setEmployees] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [globalNhom, setGlobalNhom] = useState('');
  const [globalKinh, setGlobalKinh] = useState('');
  const [globalTaynam, setGlobalTaynam] = useState('');

  // States cho phụ kiện bếp
  const [phukienList, setPhukienList] = useState([]);
  const [loaiphukienList, setLoaiphukienList] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState('tu_bep'); // 'tu_bep' hoặc 'phu_kien_bep'

  // States cho công trình
  const [congTrinh, setCongTrinh] = useState({
    name_congtrinh: '',
    name_customer: '',
    sdt: '',
    email: '',
    Id_sale: '',
    ngan_sach_du_kien: '',
    mo_ta: '',
    dia_chi: '',
    bao_gia: ''
  });

  // States cho danh sách công trình và công trình được chọn
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  // States cho modal công trình
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectInputs, setShowProjectInputs] = useState(false);

  // States cho inline editing
  const [editingProjectInline, setEditingProjectInline] = useState(null);
  const [showInlineEditForm, setShowInlineEditForm] = useState(false);

  // States cho cost management
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [projectExpenses, setProjectExpenses] = useState([]);
  const [showCostForm, setShowCostForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [costForm, setCostForm] = useState({
    id_lcp: '',
    giathanh: '',
    mo_ta: 'dự toán',
    parent_id: '',
    created_at: new Date().toISOString().split('T')[0]
  });
  const [availableParents, setAvailableParents] = useState([]);

  useEffect(() => {
    fetchData();
    fetchEmployees();
    fetchProjects();
    fetchExpenseCategories();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/v1/payroll/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/quote/cong_trinh/');
      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/accounting/loaichiphi/');
      if (response.ok) {
        const data = await response.json();
        setExpenseCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  const fetchProjectExpenses = async (projectId) => {
    if (!projectId) {
      setProjectExpenses([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjectExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('Error fetching project expenses:', error);
      setProjectExpenses([]);
    }
  };

  const handleProjectSelection = async (projectId) => {
    setSelectedProject(projectId);
    if (projectId) {
      const selectedProj = projects.find(p => p.id === parseInt(projectId));
      if (selectedProj) {
        // Auto-fill customer name and sales employee
        setCustomerName(selectedProj.name_customer || '');
        setSalesEmployee(selectedProj.Id_sale || '');
        
        // Also update project info fields
        setCongTrinh({
          name_congtrinh: selectedProj.name_congtrinh || '',
          name_customer: selectedProj.name_customer || '',
          sdt: selectedProj.sdt || '',
          email: selectedProj.email || '',
          Id_sale: selectedProj.Id_sale || '',
          ngan_sach_du_kien: selectedProj.ngan_sach_du_kien || '',
          dia_chi: selectedProj.dia_chi || '',
          mo_ta: selectedProj.mo_ta || '',
          bao_gia: selectedProj.bao_gia || ''
        });

        // Fetch project expenses
        await fetchProjectExpenses(projectId);

        // Fetch existing quote data for this project
        try {
          const response = await fetch(`http://localhost:8001/api/v1/quote/invoices_quote/project/${projectId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.quotes && data.quotes.length > 0) {
              // Get the most recent quote
              const latestQuote = data.quotes[0];
              
              // Pre-fill quote form fields
              setCustomerName(latestQuote.customer_name || selectedProj.name_customer || '');
              setSalesEmployee(latestQuote.sales_employee_id || selectedProj.Id_sale || '');
              setCommissionPercentage(latestQuote.commission_percentage || 5);
              
              // Parse invoice date and time
              if (latestQuote.invoice_date) {
                const invoiceDateTime = new Date(latestQuote.invoice_date);
                setInvoiceDate(invoiceDateTime.toISOString().split('T')[0]);
                setInvoiceTime(invoiceDateTime.toTimeString().split(' ')[0]);
              }
              
              // Pre-fill invoice items
              if (latestQuote.items && latestQuote.items.length > 0) {
                const items = latestQuote.items.map(item => ({
                  id: Date.now() + Math.random(), // Generate new ID for frontend
                  loai_san_pham: item.loai_san_pham || 'tu_bep',
                  // For tủ bếp items
                  id_nhom: item.id_nhom || '',
                  id_kinh: item.id_kinh || '',
                  id_taynam: item.id_taynam || '',
                  id_bophan: item.id_bophan || '',
                  sanpham: item.sanpham || null,
                  ngang: item.ngang || 0,
                  cao: item.cao || 0,
                  sau: item.sau || 0,
                  so_luong: item.so_luong || 1,
                  don_gia: item.don_gia || 0,
                  dien_tich_ke_hoach: item.dien_tich_ke_hoach || 0,
                  dien_tich_thuc_te: item.dien_tich_thuc_te || 0,
                  ti_le: item.ti_le || 0,
                  chiet_khau: item.chiet_khau || 0,
                  thanh_tien: item.thanh_tien || 0,
                  // For phụ kiện bếp items
                  id_loaiphukien: item.id_loaiphukien || '',
                  id_phukien: item.id_phukien || '',
                  loaiphukien: item.loaiphukien || null,
                  phukien: item.phukien || null
                }));
                setInvoiceItems(items);
                
                // Set product type based on first item
                const firstItem = latestQuote.items[0];
                setSelectedProductType(firstItem.loai_san_pham === 'phu_kien_bep' ? 'phu_kien_bep' : 'tu_bep');
                
                // Set selected bophans based on items
                const bophans = [...new Set(latestQuote.items.map(item => item.id_bophan).filter(Boolean))];
                setSelectedBophans(bophans);
                
                // Try to infer global selections from first tủ bếp item
                const tuBepItems = latestQuote.items.filter(item => item.loai_san_pham !== 'phu_kien_bep');
                if (tuBepItems.length > 0) {
                  const firstTuBepItem = tuBepItems[0];
                  setGlobalNhom(firstTuBepItem.id_nhom || '');
                  setGlobalKinh(firstTuBepItem.id_kinh || '');
                  setGlobalTaynam(firstTuBepItem.id_taynam || '');
                }
              }
              
              alert('Đã tải dữ liệu báo giá hiện có cho công trình này!');
            }
          }
        } catch (error) {
          console.error('Error fetching existing quote data:', error);
        }
      }
    } else {
      // Reset when no project selected
      setCustomerName('');
      setSalesEmployee('');
      setCommissionPercentage(5);
      setInvoiceItems([]);
      setSelectedProductType('tu_bep');
      setSelectedBophans([]);
      setGlobalNhom('');
      setGlobalKinh('');
      setGlobalTaynam('');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setInvoiceTime(new Date().toTimeString().split(' ')[0]);
      setCongTrinh({
        name_congtrinh: '',
        name_customer: '',
        sdt: '',
        email: '',
        Id_sale: '',
        ngan_sach_du_kien: '',
        mo_ta: '',
        dia_chi: '',
        bao_gia: ''
      });
      setProjectExpenses([]);
    }
  };

  const handleViewProjectQuotes = (projectId) => {
    // Chuyển hướng đến trang hiển thị đơn hàng báo giá của công trình
    router.push(`/dashboard/quote/project/${projectId}`);
  };

  const saveProjectInfo = async () => {
    if (!congTrinh.name_congtrinh.trim()) {
      alert('Vui lòng nhập tên công trình');
      return;
    }

    if (!congTrinh.name_customer.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    try {
      const projectData = {
        name_congtrinh: congTrinh.name_congtrinh,
        name_customer: congTrinh.name_customer,
        sdt: congTrinh.sdt,
        email: congTrinh.email,
        Id_sale: congTrinh.Id_sale,
        ngan_sach_du_kien: parseFloat(congTrinh.ngan_sach_du_kien) || 0,
        dia_chi: congTrinh.dia_chi,
        mo_ta: congTrinh.mo_ta,
        bao_gia: parseFloat(congTrinh.bao_gia) || 0
      };

      const url = editingProject
        ? `http://localhost:8001/api/v1/quote/cong_trinh/${editingProject.id}`
        : 'http://localhost:8001/api/v1/quote/cong_trinh/';

      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        alert(editingProject ? 'Thông tin công trình đã được cập nhật thành công!' : 'Thông tin công trình đã được lưu thành công!');
        // Reload projects list
        fetchProjects();
        // Reset form and close modal
        setCongTrinh({
          name_congtrinh: '',
          name_customer: '',
          sdt: '',
          email: '',
          Id_sale: '',
          ngan_sach_du_kien: '',
          mo_ta: '',
          dia_chi: '',
          bao_gia: ''
        });
        setEditingProject(null);
        setShowProjectModal(false);
        setShowInlineEditForm(false);
        setEditingProjectInline(null);
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra khi ${editingProject ? 'cập nhật' : 'lưu'} thông tin công trình: ${errorData.detail || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error saving project info:', error);
      alert(`Có lỗi xảy ra khi ${editingProject ? 'cập nhật' : 'lưu'} thông tin công trình`);
    }
  };

  const openProjectModal = (project = null) => {
    if (project) {
      // Editing mode
      setEditingProject(project);
      setCongTrinh({
        name_congtrinh: project.name_congtrinh || '',
        name_customer: project.name_customer || '',
        sdt: project.sdt || '',
        email: project.email || '',
        Id_sale: project.Id_sale || '',
        ngan_sach_du_kien: project.ngan_sach_du_kien || '',
        dia_chi: project.dia_chi || '',
        mo_ta: project.mo_ta || '',
        bao_gia: project.bao_gia || ''
      });
    } else {
      // Creating mode
      setEditingProject(null);
      setCongTrinh({
        name_congtrinh: '',
        name_customer: '',
        sdt: '',
        email: '',
        Id_sale: '',
        ngan_sach_du_kien: '',
        mo_ta: '',
        dia_chi: '',
        bao_gia: ''
      });
    }
    setShowProjectModal(true);
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/quote/cong_trinh/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Công trình đã được xóa thành công!');
        // Reload projects list
        fetchProjects();
        // If the deleted project was selected, reset selection
        if (selectedProject === projectId.toString()) {
          setSelectedProject('');
          setCustomerName('');
          setSalesEmployee('');
          setCongTrinh({
            name_congtrinh: '',
            name_customer: '',
            sdt: '',
            email: '',
            Id_sale: '',
            ngan_sach_du_kien: '',
            mo_ta: '',
            dia_chi: '',
            bao_gia: ''
          });
        }
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra khi xóa công trình: ${errorData.detail || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Có lỗi xảy ra khi xóa công trình');
    }
  };

  const fetchData = async () => {
    try {
      const [sanphamRes, chitietsanphamRes, loainhomRes, loaikinhRes, loaitaynamRes, bophanRes, phukienRes, loaiphukienRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/accounting/sanpham/'),
        fetch('http://localhost:8001/api/v1/accounting/chitietsanpham/'),
        fetch('http://localhost:8001/api/v1/accounting/loainhom/'),
        fetch('http://localhost:8001/api/v1/accounting/loaikinh/'),
        fetch('http://localhost:8001/api/v1/accounting/loaitaynam/'),
        fetch('http://localhost:8001/api/v1/accounting/bophan/'),
        fetch('http://localhost:8001/api/v1/accounting/phukienbep/'),
        fetch('http://localhost:8001/api/v1/accounting/loaiphukienbep/')
      ]);

      if (sanphamRes.ok) setSanphamList(await sanphamRes.json());
      if (chitietsanphamRes.ok) setChitietsanphamList(await chitietsanphamRes.json());
      if (loainhomRes.ok) setLoainhomList(await loainhomRes.json());
      if (loaikinhRes.ok) setLoaikinhList(await loaikinhRes.json());
      if (loaitaynamRes.ok) setLoaitaynamList(await loaitaynamRes.json());
      if (bophanRes.ok) setBophanList(await bophanRes.json());
      if (phukienRes.ok) setPhukienList(await phukienRes.json());
      if (loaiphukienRes.ok) setLoaiphukienList(await loaiphukienRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInvoiceItem = () => {
    if (selectedProductType === 'tu_bep') {
      // Thêm sản phẩm tủ bếp
      const newItem = {
        id: Date.now(),
        loai_san_pham: 'tu_bep',
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
        chiet_khau: 0,
        thanh_tien: 0
      };
      setInvoiceItems([...invoiceItems, newItem]);
    } else {
      // Thêm phụ kiện bếp
      const newItem = {
        id: Date.now(),
        loai_san_pham: 'phu_kien_bep',
        id_phukien: '',
        phukien: null,
        so_luong: 1,
        don_gia: 0,
        chiet_khau: 0,
        thanh_tien: 0
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
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
            chiet_khau: 0,
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
          chiet_khau: 0,
          thanh_tien: 0
        };
        updatedItems.push(item);
      }
      // Không reset lại id_nhom, id_kinh, id_taynam - giữ nguyên giá trị hiện tại

      // Tự động tìm sản phẩm và cập nhật thông tin với các lựa chọn hiện tại
      if (item.id_nhom && item.id_kinh && item.id_taynam && item.id_bophan) {
        let availableProducts = sanphamList.filter(sp => 
          sp.id_nhom === item.id_nhom && 
          sp.id_kinh === item.id_kinh && 
          sp.id_taynam === item.id_taynam && 
          sp.id_bophan === item.id_bophan
        );
        
        let selectedProduct = null;
        
        // Ưu tiên sản phẩm có cùng tên với sản phẩm hiện tại
        if (item.sanpham && availableProducts.length > 0) {
          const currentProductName = item.sanpham.tensp;
          selectedProduct = availableProducts.find(sp => sp.tensp === currentProductName);
        }
        
        // Nếu không tìm thấy sản phẩm cùng tên, chọn sản phẩm đầu tiên
        if (!selectedProduct && availableProducts.length > 0) {
          selectedProduct = availableProducts[0];
        }
        
        if (selectedProduct) {
          item.sanpham = selectedProduct;
          const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === selectedProduct.id);
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
            let availableProducts = sanphamList.filter(sp => 
              sp.id_nhom === currentNhom && 
              sp.id_kinh === currentKinh && 
              sp.id_taynam === currentTaynam && 
              sp.id_bophan === currentBophan
            );
            
            let selectedProduct = null;
            
            // Ưu tiên sản phẩm có cùng tên với sản phẩm hiện tại
            if (updatedItem.sanpham && availableProducts.length > 0) {
              const currentProductName = updatedItem.sanpham.tensp;
              selectedProduct = availableProducts.find(sp => sp.tensp === currentProductName);
            }
            
            // Nếu không tìm thấy sản phẩm cùng tên, chọn sản phẩm đầu tiên
            if (!selectedProduct && availableProducts.length > 0) {
              selectedProduct = availableProducts[0];
            }
            
            if (selectedProduct) {
              updatedItem.sanpham = selectedProduct;
              // Tìm chi tiết sản phẩm
              const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === selectedProduct.id);
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
        
        // Xử lý khi chọn sản phẩm trực tiếp từ dropdown
        if (field === 'sanpham_id') {
          if (value) {
            const selectedSanpham = sanphamList.find(sp => sp.id === value);
            if (selectedSanpham) {
              updatedItem.sanpham = selectedSanpham;
              // Tự động cập nhật các loại từ sản phẩm đã chọn
              updatedItem.id_nhom = selectedSanpham.id_nhom;
              updatedItem.id_kinh = selectedSanpham.id_kinh;
              updatedItem.id_taynam = selectedSanpham.id_taynam;
              updatedItem.id_bophan = selectedSanpham.id_bophan;
              
              // Tìm chi tiết sản phẩm
              const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === selectedSanpham.id);
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
            }
          } else {
            // Reset khi không chọn sản phẩm
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
        
        // Xử lý cho phụ kiện bếp
        if (field === 'id_loaiphukien') {
          // Khi chọn loại phụ kiện, reset tên phụ kiện và các giá trị liên quan
          updatedItem.id_phukien = '';
          updatedItem.phukien = null;
          updatedItem.loaiphukien = loaiphukienList.find(loai => parseInt(loai.id) === parseInt(value)) || null;
          updatedItem.don_gia = 0;
          updatedItem.thanh_tien = 0;
          calculateInvoiceItem(updatedItem);
        }
        
        if (field === 'id_phukien') {
          // Khi chọn tên phụ kiện, tự động điền giá và kích thước
          if (value && value !== '') {
            const phukienId = parseInt(value);
            const foundPhukien = phukienList.find(phukien => phukien.id === phukienId);
            if (foundPhukien) {
              updatedItem.phukien = foundPhukien;
              // Tự động điền giá từ phụ kiện
              updatedItem.don_gia = foundPhukien.don_gia || 0;
              // Nếu chưa có loaiphukien, set từ phụ kiện
              if (!updatedItem.loaiphukien) {
                updatedItem.loaiphukien = loaiphukienList.find(loai => parseInt(loai.id) === parseInt(foundPhukien.id_loaiphukien)) || null;
              }
              // Tính lại thành tiền
              calculateInvoiceItem(updatedItem);
            } else {
              updatedItem.phukien = null;
              updatedItem.don_gia = 0;
              calculateInvoiceItem(updatedItem);
            }
          } else {
            updatedItem.phukien = null;
            updatedItem.don_gia = 0;
            calculateInvoiceItem(updatedItem);
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
        if (field === 'don_gia') {
          calculateInvoiceItem(updatedItem);
        }
        if (field === 'chiet_khau') {
          calculateInvoiceItem(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateInvoiceItem = (item) => {
    // Nếu là phụ kiện bếp, chỉ cần tính đơn giá * số lượng - chiết khấu
    if (item.loai_san_pham === 'phu_kien_bep') {
      const thanh_tien_truoc_chiet_khau = (item.don_gia || 0) * (item.so_luong || 1);
      const chiet_khau_amount = (thanh_tien_truoc_chiet_khau * (item.chiet_khau || 0)) / 100;
      item.thanh_tien = thanh_tien_truoc_chiet_khau - chiet_khau_amount;
      return;
    }

    // Tính toán cho tủ bếp (logic cũ)
    const ngang = item.ngang || 0;
    const cao = item.cao || 0;
    const sau = item.sau || 0;
    const dien_tich_ke_hoach = item.dien_tich_ke_hoach || 0;
    
    // Diện tích thực tế với kích thước điều chỉnh
    const dien_tich_thuc_te = (ngang * cao + ngang * sau + cao * sau) * 2;
    
    // Tỉ lệ
    const ti_le = dien_tich_ke_hoach > 0 ? (dien_tich_thuc_te / dien_tich_ke_hoach) : 0;
    
    // Thành tiền trước chiết khấu
    const thanh_tien_truoc_chiet_khau = ti_le * (item.don_gia || 0) * (item.so_luong || 1);
    
    // Tính chiết khấu
    const chiet_khau_amount = (thanh_tien_truoc_chiet_khau * (item.chiet_khau || 0)) / 100;
    
    // Thành tiền sau chiết khấu
    const thanh_tien = thanh_tien_truoc_chiet_khau - chiet_khau_amount;
    
    item.dien_tich_thuc_te = dien_tich_thuc_te;
    item.ti_le = ti_le;
    item.thanh_tien = thanh_tien;
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);
  };

  const saveProjectExpense = async () => {
    if (!selectedProject) {
      alert('Vui lòng chọn công trình trước khi thêm chi phí');
      return;
    }

    if (!costForm.id_lcp) {
      alert('Vui lòng chọn loại chi phí');
      return;
    }

    try {
      const expenseData = {
        id_lcp: parseInt(costForm.id_lcp),
        giathanh: parseFloat(costForm.giathanh) || null,
        mo_ta: costForm.mo_ta || 'dự toán',
        parent_id: costForm.parent_id ? parseInt(costForm.parent_id) : null,
        created_at: costForm.created_at,
        id_congtrinh: parseInt(selectedProject)
      };

      const url = editingExpense
        ? `http://localhost:8001/api/v1/accounting/quanly_chiphi/${editingExpense.id}`
        : 'http://localhost:8001/api/v1/accounting/quanly_chiphi/';

      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        alert(editingExpense ? 'Cập nhật chi phí thành công!' : 'Thêm chi phí thành công!');
        // Refresh project expenses
        await fetchProjectExpenses(selectedProject);
        // Reset form
        setCostForm({
          id_lcp: '',
          giathanh: '',
          mo_ta: 'dự toán',
          parent_id: '',
          created_at: new Date().toISOString().split('T')[0]
        });
        setEditingExpense(null);
        setShowCostForm(false);
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra: ${errorData.detail || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Có lỗi xảy ra khi lưu chi phí');
    }
  };

  const deleteProjectExpense = async (expenseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/quanly_chiphi/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa chi phí thành công!');
        // Refresh project expenses
        await fetchProjectExpenses(selectedProject);
      } else {
        alert('Có lỗi xảy ra khi xóa chi phí');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Có lỗi xảy ra khi xóa chi phí');
    }
  };

  const editProjectExpense = (expense) => {
    setEditingExpense(expense);
    setCostForm({
      id_lcp: expense.id_lcp?.toString() || '',
      giathanh: expense.giathanh ? expense.giathanh.toString() : '',
      mo_ta: expense.mo_ta || 'dự toán',
      parent_id: expense.parent_id?.toString() || '',
      created_at: expense.created_at ? new Date(expense.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowCostForm(true);
  };

  const saveInvoice = async () => {
    if (!customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    if (!salesEmployee) {
      alert('Vui lòng chọn nhân viên bán hàng');
      return;
    }

    if (!selectedProject) {
      alert('Vui lòng chọn công trình');
      return;
    }

    if (invoiceItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      const invoiceData = {
        customer_name: customerName,
        sales_employee_id: salesEmployee,
        commission_percentage: commissionPercentage,
        invoice_date: `${invoiceDate}T${invoiceTime}:00`,
        id_congtrinh: parseInt(selectedProject),
        items: invoiceItems.map(item => ({
          loai_san_pham: item.loai_san_pham,
          id_nhom: item.id_nhom || null,
          id_kinh: item.id_kinh || null,
          id_taynam: item.id_taynam || null,
          id_bophan: item.id_bophan || null,
          sanpham_id: item.sanpham?.id || null,
          ngang: item.ngang || 0,
          cao: item.cao || 0,
          sau: item.sau || 0,
          so_luong: item.so_luong || 1,
          don_gia: item.don_gia || 0,
          dien_tich_ke_hoach: item.dien_tich_ke_hoach || 0,
          dien_tich_thuc_te: item.dien_tich_thuc_te || 0,
          ti_le: item.ti_le || 0,
          chiet_khau: item.chiet_khau || 0,
          thanh_tien: item.thanh_tien || 0,
          id_loaiphukien: item.id_loaiphukien || null,
          id_phukien: item.id_phukien || null
        }))
      };

      const response = await fetch('http://localhost:8001/api/v1/quote/invoices_quote/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Đơn hàng báo giá đã được lưu thành công!');
        
        // Update bao_gia in cong_trinh
        const totalAmount = calculateTotal();
        try {
          await fetch(`http://localhost:8001/api/v1/quote/cong_trinh/${selectedProject}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bao_gia: totalAmount
            })
          });
        } catch (error) {
          console.error('Error updating bao_gia:', error);
        }
        
        // Reset form
        setCustomerName('');
        setSalesEmployee('');
        setCommissionPercentage(5);
        setInvoiceItems([]);
        setSelectedProductType('tu_bep');
        setSelectedBophans([]);
        setGlobalNhom('');
        setGlobalKinh('');
        setGlobalTaynam('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setInvoiceTime(new Date().toTimeString().split(' ')[0]);
        setSelectedProject('');
        setProjectExpenses([]);
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra khi lưu đơn hàng: ${errorData.detail || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Có lỗi xảy ra khi lưu đơn hàng');
    }
  };

  // Update useEffect to fetch available parents when cost form is shown
  useEffect(() => {
    if (showCostForm && selectedProject) {
      fetchAvailableParents();
    }
  }, [showCostForm, selectedProject]);

  if (loading) {
    return <div className="p-6">Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Báo giá Đơn hàng</h2>
          <p className="text-gray-600 mt-1">Tạo và quản lý đơn hàng báo giá</p>
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
            <span>Lưu Đơn hàng</span>
          </button>
        </div>
      </div>

      {/* Công trình Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin công trình</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProjectInputs(!showProjectInputs)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showProjectInputs ? 'Ẩn' : 'Thêm'} thông tin công trình</span>
            </button>
          </div>
        </div>

        {/* Danh sách công trình */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Danh sách công trình ({projects.length})
          </h4>
          {projects.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Chưa có công trình nào</p>
              <p className="text-gray-400 text-sm mt-1">Hãy thêm công trình mới để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Icon và tên công trình */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg">{project.name_congtrinh}</h5>
                            <p className="text-sm text-gray-600">{project.name_customer}</p>
                          </div>
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="hidden md:flex items-center space-x-6 flex-1 ml-6">
                          {project.sdt && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{project.sdt}</span>
                            </div>
                          )}
                          {project.email && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="truncate max-w-32">{project.email}</span>
                            </div>
                          )}
                          {project.dia_chi && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate max-w-48">{project.dia_chi}</span>
                            </div>
                          )}
                          {project.ngan_sach_du_kien && (
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                              <span className="text-sm font-medium text-green-700">
                                {parseInt(project.ngan_sach_du_kien).toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleProjectSelection(project.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Chọn</span>
                        </button>
                        <button
                          onClick={() => handleViewProjectQuotes(project.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Xem đơn hàng</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingProjectInline(project);
                            setShowInlineEditForm(true);
                            setCongTrinh({
                              name_congtrinh: project.name_congtrinh,
                              name_customer: project.name_customer,
                              sdt: project.sdt,
                              email: project.email,
                              Id_sale: project.Id_sale,
                              ngan_sach_du_kien: project.ngan_sach_du_kien,
                              dia_chi: project.dia_chi,
                              mo_ta: project.mo_ta,
                              bao_gia: project.bao_gia
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Sửa công trình"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa công trình "${project.name_congtrinh}" không?`)) {
                              deleteProject(project.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Xóa công trình"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile view - thông tin bổ sung */}
                    <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {project.sdt && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{project.sdt}</span>
                          </div>
                        )}
                        {project.email && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{project.email}</span>
                          </div>
                        )}
                        {project.dia_chi && (
                          <div className="col-span-2 flex items-center space-x-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{project.dia_chi}</span>
                          </div>
                        )}
                        {project.ngan_sach_du_kien && (
                          <div className="col-span-2 mt-2">
                            <div className="bg-green-50 px-3 py-2 rounded-lg inline-block">
                              <span className="text-sm font-medium text-green-700">
                                Ngân sách: {parseInt(project.ngan_sach_du_kien).toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mô tả nếu có */}
                    {project.mo_ta && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">{project.mo_ta}</p>
                      </div>
                    )}

                    {/* Nhân viên sale */}
                    {project.Id_sale && employees.find(emp => emp.ma_nv === project.Id_sale) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-700 font-medium">
                            Nhân viên kinh doanh: {employees.find(emp => emp.ma_nv === project.Id_sale)?.ho_ten}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inline Edit Form */}
        {showInlineEditForm && editingProjectInline && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Sửa thông tin công trình: {editingProjectInline.name_congtrinh}</h4>
              <button
                onClick={() => {
                  setShowInlineEditForm(false);
                  setEditingProjectInline(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên công trình *</label>
                <input
                  type="text"
                  value={congTrinh.name_congtrinh}
                  onChange={(e) => setCongTrinh({...congTrinh, name_congtrinh: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập tên công trình"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng *</label>
                <input
                  type="text"
                  value={congTrinh.name_customer}
                  onChange={(e) => setCongTrinh({...congTrinh, name_customer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập tên khách hàng"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={congTrinh.sdt}
                  onChange={(e) => setCongTrinh({...congTrinh, sdt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={congTrinh.email}
                  onChange={(e) => setCongTrinh({...congTrinh, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên kinh doanh</label>
                <select
                  value={congTrinh.Id_sale}
                  onChange={(e) => setCongTrinh({...congTrinh, Id_sale: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Chọn nhân viên kinh doanh</option>
                  {employees.map(employee => (
                    <option key={employee.ma_nv} value={employee.ma_nv}>
                      {employee.ho_ten} ({employee.ma_nv})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngân sách dự kiến (VND)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={congTrinh.ngan_sach_du_kien}
                  onChange={(e) => setCongTrinh({...congTrinh, ngan_sach_du_kien: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập ngân sách dự kiến"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Báo giá (VND)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={congTrinh.bao_gia}
                  onChange={(e) => setCongTrinh({...congTrinh, bao_gia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập báo giá"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={congTrinh.dia_chi}
                  onChange={(e) => setCongTrinh({...congTrinh, dia_chi: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập địa chỉ công trình"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={congTrinh.mo_ta}
                  onChange={(e) => setCongTrinh({...congTrinh, mo_ta: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nhập mô tả công trình"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInlineEditForm(false);
                  setEditingProjectInline(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={saveProjectInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Cập nhật công trình</span>
              </button>
            </div>
          </div>
        )}

        {/* Input fields for project info - only show when showProjectInputs is true */}
        {showProjectInputs && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên công trình</label>
                <input
                  type="text"
                  value={congTrinh.name_congtrinh}
                  onChange={(e) => setCongTrinh({...congTrinh, name_congtrinh: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                  placeholder="Nhập tên công trình"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
                <input
                  type="text"
                  value={congTrinh.name_customer}
                  onChange={(e) => setCongTrinh({...congTrinh, name_customer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={congTrinh.sdt}
                  onChange={(e) => setCongTrinh({...congTrinh, sdt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={congTrinh.email}
                  onChange={(e) => setCongTrinh({...congTrinh, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên kinh doanh</label>
                <select
                  value={congTrinh.Id_sale}
                  onChange={(e) => setCongTrinh({...congTrinh, Id_sale: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                >
                  <option value="">Chọn nhân viên kinh doanh</option>
                  {employees.map(employee => (
                    <option key={employee.ma_nv} value={employee.ma_nv}>
                      {employee.ho_ten} ({employee.ma_nv})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngân sách dự kiến (VND)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={congTrinh.ngan_sach_du_kien}
                  onChange={(e) => setCongTrinh({...congTrinh, ngan_sach_du_kien: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50 text-black"
                  placeholder="Nhập ngân sách dự kiến"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Báo giá (VND)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={congTrinh.bao_gia}
                  onChange={(e) => setCongTrinh({...congTrinh, bao_gia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50 text-black"
                  placeholder="Nhập báo giá"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={congTrinh.dia_chi}
                  onChange={(e) => setCongTrinh({...congTrinh, dia_chi: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                  placeholder="Nhập địa chỉ công trình"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={congTrinh.mo_ta}
                  onChange={(e) => setCongTrinh({...congTrinh, mo_ta: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50 text-black"
                  placeholder="Nhập mô tả công trình"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={saveProjectInfo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin công trình</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Chọn công trình */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn công trình</h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Công trình có sẵn</label>
          <select
            value={selectedProject}
            onChange={(e) => handleProjectSelection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
          >
            <option value="">Chọn công trình hoặc nhập thông tin mới</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name_congtrinh} - {project.name_customer}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-2">
            💡 Chọn công trình để tự động điền tên khách hàng và nhân viên bán hàng
          </p>
        </div>
      </div>

      {/* Modal for Project Info */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProject ? 'Sửa thông tin công trình' : 'Thêm công trình mới'}
                </h3>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên công trình *</label>
                  <input
                    type="text"
                    value={congTrinh.name_congtrinh}
                    onChange={(e) => setCongTrinh({...congTrinh, name_congtrinh: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập tên công trình"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng *</label>
                  <input
                    type="text"
                    value={congTrinh.name_customer}
                    onChange={(e) => setCongTrinh({...congTrinh, name_customer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập tên khách hàng"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={congTrinh.sdt}
                    onChange={(e) => setCongTrinh({...congTrinh, sdt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={congTrinh.email}
                    onChange={(e) => setCongTrinh({...congTrinh, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên kinh doanh</label>
                  <select
                    value={congTrinh.Id_sale}
                    onChange={(e) => setCongTrinh({...congTrinh, Id_sale: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="">Chọn nhân viên kinh doanh</option>
                    {employees.map(employee => (
                      <option key={employee.ma_nv} value={employee.ma_nv}>
                        {employee.ho_ten} ({employee.ma_nv})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngân sách dự kiến (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={congTrinh.ngan_sach_du_kien}
                    onChange={(e) => setCongTrinh({...congTrinh, ngan_sach_du_kien: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập ngân sách dự kiến"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Báo giá (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={congTrinh.bao_gia}
                    onChange={(e) => setCongTrinh({...congTrinh, bao_gia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập báo giá"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                  <input
                    type="text"
                    value={congTrinh.dia_chi}
                    onChange={(e) => setCongTrinh({...congTrinh, dia_chi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập địa chỉ công trình"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={congTrinh.mo_ta}
                    onChange={(e) => setCongTrinh({...congTrinh, mo_ta: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Nhập mô tả công trình"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={saveProjectInfo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProject ? 'Cập nhật' : 'Lưu'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Info */}
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

      {/* Invoice Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết báo giá</h3>
          <div className="flex items-center space-x-4">
            {/* Chọn loại sản phẩm */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Loại sản phẩm:</label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="productType"
                    value="tu_bep"
                    checked={selectedProductType === 'tu_bep'}
                    onChange={(e) => setSelectedProductType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Tủ bếp</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="productType"
                    value="phu_kien_bep"
                    checked={selectedProductType === 'phu_kien_bep'}
                    onChange={(e) => setSelectedProductType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Phụ kiện bếp</span>
                </label>
              </div>
            </div>
            <button
              onClick={addInvoiceItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm {selectedProductType === 'tu_bep' ? 'sản phẩm tủ bếp' : 'phụ kiện bếp'}</span>
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
        {selectedBophans.length > 0 && selectedProductType === 'tu_bep' && (
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
                    <select
                      value={item.sanpham ? item.sanpham.id : ''}
                      onChange={(e) => {
                        const selectedSanphamId = e.target.value;
                        if (selectedSanphamId) {
                          const selectedSanpham = sanphamList.find(sp => sp.id === selectedSanphamId);
                          if (selectedSanpham) {
                            // Tự động điền thông tin từ sản phẩm đã chọn
                            const foundDetail = chitietsanphamList.find(detail => detail.id_sanpham === selectedSanpham.id);
                            if (foundDetail) {
                              const isSpecialDepartment = item.id_bophan === 'TN' || item.id_bophan === 'MC' || item.id_bophan === 'TL';
                              const minSize = isSpecialDepartment ? 1 : 300;
                              const maxSize = item.id_bophan === 'TL' ? 1000 : 900;
                              
                              // Cập nhật các trường select cho loại nhôm, kính, tay nắm
                              updateInvoiceItem(item.id, 'id_nhom', foundDetail.id_nhom || selectedSanpham.id_nhom || globalNhom);
                              updateInvoiceItem(item.id, 'id_kinh', foundDetail.id_kinh || selectedSanpham.id_kinh || globalKinh);
                              updateInvoiceItem(item.id, 'id_taynam', foundDetail.id_taynam || selectedSanpham.id_taynam || globalTaynam);
                              
                              updateInvoiceItem(item.id, 'sanpham_id', selectedSanpham.id);
                              updateInvoiceItem(item.id, 'ngang', foundDetail.ngang);
                              updateInvoiceItem(item.id, 'cao', Math.max(minSize, Math.min(maxSize, foundDetail.cao)));
                              updateInvoiceItem(item.id, 'sau', Math.max(minSize, Math.min(maxSize, foundDetail.sau)));
                              updateInvoiceItem(item.id, 'don_gia', foundDetail.don_gia);
                            }
                          }
                        } else {
                          // Reset khi không chọn sản phẩm
                          updateInvoiceItem(item.id, 'sanpham_id', '');
                        }
                      }}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !(item.id_nhom || globalNhom) || !(item.id_kinh || globalKinh) || !(item.id_taynam || globalTaynam) 
                          ? 'bg-red-50 text-red-700' 
                          : 'bg-green-100 text-black'
                      }`}
                    >
                      <option value="">
                        {!(item.id_nhom || globalNhom) || !(item.id_kinh || globalKinh) || !(item.id_taynam || globalTaynam) 
                          ? "Vui lòng chọn đầy đủ các loại (nhôm, kính, tay nắm)" 
                          : "Chọn sản phẩm hoặc để tự động chọn"
                        }
                      </option>
                      {(() => {
                        // Ưu tiên sản phẩm có cùng tên trước
                        const currentNhom = item.id_nhom || globalNhom;
                        const currentKinh = item.id_kinh || globalKinh;
                        const currentTaynam = item.id_taynam || globalTaynam;
                        const currentBophan = item.id_bophan;
                        
                        // Lọc sản phẩm theo các loại đã chọn
                        let filteredProducts = sanphamList.filter(sp => {
                          return (!currentNhom || sp.id_nhom === currentNhom) &&
                                 (!currentKinh || sp.id_kinh === currentKinh) &&
                                 (!currentTaynam || sp.id_taynam === currentTaynam) &&
                                 (!currentBophan || sp.id_bophan === currentBophan);
                        });
                        
                        // Nếu có sản phẩm hiện tại, ưu tiên sản phẩm có cùng tên
                        if (item.sanpham) {
                          const currentProductName = item.sanpham.tensp;
                          const sameNameProducts = filteredProducts.filter(sp => sp.tensp === currentProductName);
                          if (sameNameProducts.length > 0) {
                            // Đưa sản phẩm cùng tên lên đầu
                            const otherProducts = filteredProducts.filter(sp => sp.tensp !== currentProductName);
                            filteredProducts = [...sameNameProducts, ...otherProducts];
                          }
                        }
                        
                        return filteredProducts.map(sanpham => {
                          const detail = chitietsanphamList.find(d => d.id_sanpham === sanpham.id);
                          const nhomName = loainhomList.find(n => n.id === (detail?.id_nhom || sanpham.id_nhom))?.tenloai || 'N/A';
                          const kinhName = loaikinhList.find(k => k.id === (detail?.id_kinh || sanpham.id_kinh))?.tenloai || 'N/A';
                          const taynamName = loaitaynamList.find(t => t.id === (detail?.id_taynam || sanpham.id_taynam))?.tenloai || 'N/A';
                          const displayName = sanpham.tensp;
                          const isSameName = item.sanpham && item.sanpham.tensp === sanpham.tensp;
                          return (
                            <option key={sanpham.id} value={sanpham.id}>
                              {isSameName ? `⭐ ${displayName}` : displayName}
                            </option>
                          );
                        });
                      })()}
                    </select>
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
                        min="0"
                        value={item.don_gia}
                        onChange={(e) => updateInvoiceItem(item.id, 'don_gia', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-100 text-black"
                        placeholder="Nhập đơn giá"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chiết khấu (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={item.chiet_khau}
                        onChange={(e) => updateInvoiceItem(item.id, 'chiet_khau', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-red-100 text-black"
                        placeholder="0"
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thành tiền trước CK (VND)</label>
                      <input
                        type="text"
                        value={`${((item.ti_le * item.don_gia * item.so_luong) || 0).toLocaleString('vi-VN')} VND`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700"
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

        {/* Form chi tiết cho phụ kiện bếp */}
        {selectedProductType === 'phu_kien_bep' && (
          <div className="space-y-4">
            {invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Phụ kiện bếp {index + 1}</h4>
                  <button
                    onClick={() => removeInvoiceItem(item.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Xóa phụ kiện này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại phụ kiện</label>
                    <select
                      value={item.id_loaiphukien || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        updateInvoiceItem(item.id, 'id_loaiphukien', newValue);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
                    >
                      <option value="">Chọn loại phụ kiện</option>
                      {loaiphukienList.map(loai => (
                        <option key={loai.id} value={loai.id}>{loai.tenloai}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên phụ kiện</label>
                    <select
                      key={`phukien-${item.id}-${item.id_loaiphukien}`}
                      value={item.id_phukien || ''}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        updateInvoiceItem(item.id, 'id_phukien', selectedValue);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-100 text-black"
                    >
                      <option value="">Chọn phụ kiện</option>
                      {phukienList
                        .filter(phukien => {
                          const currentLoaiId = item.id_loaiphukien ? parseInt(item.id_loaiphukien) : null;
                          const phukienLoaiId = parseInt(phukien.id_loaiphukien);
                          const shouldInclude = !currentLoaiId || phukienLoaiId === currentLoaiId;
                          return shouldInclude;
                        })
                        .map(phukien => {
                          const loaiPhukien = loaiphukienList.find(loai => parseInt(loai.id) === parseInt(phukien.id_loaiphukien));
                          const displayName = loaiPhukien ? `${loaiPhukien.tenloai} - ${phukien.tenphukien}` : phukien.tenphukien;
                          return (
                            <option key={phukien.id} value={phukien.id}>{displayName}</option>
                          );
                        })}
                    </select>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thành tiền trước CK (VND)</label>
                    <input
                      type="text"
                      value={`${((item.don_gia * item.so_luong) || 0).toLocaleString('vi-VN')} VND`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chiết khấu (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.chiet_khau || 0}
                      onChange={(e) => {
                        const newChietKhau = parseFloat(e.target.value) || 0;
                        const updatedItems = invoiceItems.map(invItem =>
                          invItem.id === item.id
                            ? {
                                ...invItem,
                                chiet_khau: newChietKhau,
                                thanh_tien: Math.round((invItem.don_gia * invItem.so_luong) * (1 - newChietKhau / 100))
                              }
                            : invItem
                        );
                        setInvoiceItems(updatedItems);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                      placeholder="0.0"
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

                {/* Hiển thị thông tin chi tiết phụ kiện */}
                {item.phukien && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Thông tin chi tiết:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-700 font-medium">Thương hiệu:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.thuong_hieu || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Model:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.model || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Công suất:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.cong_suat || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Kích thước:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.kich_thuoc || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Trọng lượng:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.trong_luong ? `${item.phukien.trong_luong} kg` : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Bảo hành:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.bao_hanh || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Xuất xứ:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.xuat_xu || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Mô tả:</span>
                        <p className="font-semibold text-gray-900">{item.phukien.mo_ta || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedBophans.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có bộ phận nào được chọn</p>
            <p className="text-sm text-gray-400 mt-1">Hãy tích chọn các bộ phận cần sản xuất ở trên</p>
          </div>
        )}

        {/* Cost Management Section */}
        {selectedProject && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Quản lý chi phí dự án
              </h3>
              <button
                onClick={() => setShowCostForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm chi phí</span>
              </button>
            </div>

            {/* Cost Form Modal */}
            {showCostForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingExpense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowCostForm(false);
                          setEditingExpense(null);
                          setCostForm({
                            id_lcp: '',
                            giathanh: '',
                            mo_ta: 'dự toán',
                            parent_id: '',
                            created_at: new Date().toISOString().split('T')[0]
                          });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      saveProjectExpense();
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Loại chi phí *</label>
                          <select
                            value={costForm.id_lcp}
                            onChange={(e) => setCostForm({...costForm, id_lcp: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                            required
                          >
                            <option value="">Chọn loại chi phí</option>
                            {expenseCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.tenchiphi}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={costForm.giathanh}
                            onChange={(e) => setCostForm({...costForm, giathanh: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                            placeholder="Nhập số tiền"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày chi phí</label>
                          <input
                            type="date"
                            value={costForm.created_at}
                            onChange={(e) => setCostForm({...costForm, created_at: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chi phí cha</label>
                          <select
                            value={costForm.parent_id}
                            onChange={(e) => setCostForm({...costForm, parent_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                          >
                            <option value="">Không có chi phí cha</option>
                            {availableParents.map(parent => (
                              <option key={parent.id} value={parent.id}>
                                {parent.mo_ta || 'N/A'} - {(parent.giathanh || 0).toLocaleString('vi-VN')} VND
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <input
                          type="text"
                          value={costForm.mo_ta}
                          onChange={(e) => setCostForm({...costForm, mo_ta: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                          placeholder="Nhập mô tả chi phí"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCostForm(false);
                            setEditingExpense(null);
                            setCostForm({
                              id_lcp: '',
                              giathanh: '',
                              mo_ta: 'dự toán',
                              parent_id: '',
                              created_at: new Date().toISOString().split('T')[0]
                            });
                          }}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          {editingExpense ? 'Cập nhật' : 'Thêm chi phí'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Project Expenses List */}
            <div className="space-y-4">
              {projectExpenses.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Chưa có chi phí nào cho dự án này</p>
                  <p className="text-gray-400 text-sm mt-1">Thêm chi phí đầu tiên để theo dõi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectExpenses.map(expense => (
                    <div key={expense.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {expense.loaichiphi?.tenchiphi || 'N/A'}
                              </h4>
                              <p className="text-sm text-gray-600">{expense.mo_ta || 'N/A'}</p>
                              <p className="text-xs text-gray-500">
                                {expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {(expense.giathanh || 0).toLocaleString('vi-VN')} VND
                              </p>
                              <p className="text-sm text-gray-600">
                                {expense.loaichiphi?.loaichiphi || 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => editProjectExpense(expense)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Sửa chi phí"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProjectExpense(expense.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Xóa chi phí"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cost Summary */}
            {projectExpenses.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Tổng chi phí dự án</h4>
                    <p className="text-sm text-gray-600">
                      {projectExpenses.length} khoản chi phí
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {projectExpenses.reduce((sum, expense) => sum + (expense.giathanh || 0), 0).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Section */}
        {selectedBophans.length > 0 || invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h3 className="text-lg font-semibold text-black mb-4">Tóm tắt báo giá</h3>
            <div className="space-y-4">
              {/* Hiển thị sản phẩm tủ bếp */}
              {selectedBophans.map(bophanId => {
                const bophan = bophanList.find(b => b.id === bophanId);
                if (!bophan) return null;

                // Find the invoice item for this department
                const item = invoiceItems.find(item => item.id_bophan === bophanId);
                if (!item || !item.sanpham) return null;

                const totalPrice = item.thanh_tien || 0;

                return (
                  <div key={bophanId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-black">{item.sanpham.tensp}</h4>
                        <p className="text-sm text-gray-700">Bộ phận: {bophan.tenloai}</p>
                        <p className="text-xs text-blue-600">Loại: Tủ bếp</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {totalPrice.toLocaleString('vi-VN')} VND
                        </p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.so_luong || 0}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-700 font-medium">Kích thước thực tế:</span>
                        <p className="font-medium text-black">{item.ngang} x {item.cao} x {item.sau} mm</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Diện tích thực tế:</span>
                        <p className="font-medium text-black">{(item.dien_tich_thuc_te || 0).toLocaleString('vi-VN')} mm²</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Tỉ lệ:</span>
                        <p className="font-medium text-black">{(item.ti_le * 100 || 0).toFixed(2)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-700 font-medium">Chiết khấu:</span>
                        <p className="font-medium text-red-600">{item.chiet_khau || 0}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Hiển thị phụ kiện bếp */}
              {invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-black">{item.phukien?.tenphukien || 'Phụ kiện'}</h4>
                      <p className="text-sm text-gray-700">Loại: {item.loaiphukien?.tenloai || 'Phụ kiện bếp'}</p>
                      <p className="text-xs text-purple-600">Loại: Phụ kiện bếp</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {item.thanh_tien.toLocaleString('vi-VN')} VND
                      </p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.so_luong}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-700 font-medium">Thương hiệu:</span>
                      <p className="font-medium text-black">{item.phukien?.thuong_hieu || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Kích thước:</span>
                      <p className="font-medium text-black">{item.phukien?.kich_thuoc || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Công suất:</span>
                      <p className="font-medium text-black">{item.phukien?.cong_suat || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Chiết khấu:</span>
                      <p className="font-medium text-red-600">{item.chiet_khau || 0}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold text-black">Tóm tắt</h4>
                  <p className="text-sm text-gray-700">
                    {selectedBophans.length} bộ phận tủ bếp • {invoiceItems.filter(item => item.loai_san_pham === 'phu_kien_bep').length} phụ kiện bếp • {invoiceItems.reduce((sum, item) => sum + (item.so_luong || 0), 0)} sản phẩm
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
                <span>Lưu báo giá</span>
              </button>
            </div>
          </div>
        ) : null}
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

function QuotesTab({ salesData, products, setSalesData }) {
  const [quotes, setQuotes] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadQuotes();
    loadProjects();
    loadEmployees();
  }, [selectedMonth]);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/v1/payroll/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/quote/cong_trinh/');
      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const loadQuotes = async () => {
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:8001/api/v1/quote/invoices_quote?month=${selectedMonth}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      } else {
        const errorText = await response.text();
        console.error('Error loading quotes:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        alert(`Không thể tải danh sách đơn hàng: ${response.status} ${response.statusText}`);
        setQuotes([]);
      }
    } catch (error) {
      console.error('Network error loading quotes:', error);
      alert('Lỗi kết nối mạng. Vui lòng kiểm tra backend server.');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const printQuote = (quote) => {
    const printWindow = window.open('', '_blank');
    const quoteHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Đơn hàng - ${quote.customer_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .quote-info { margin-bottom: 20px; }
            .quote-info div { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ĐƠN HÀNG</h1>
            <h2>Công ty TNHH Nội Thất ABC</h2>
          </div>
          
          <div class="quote-info">
            <div><strong>Tên khách hàng:</strong> ${quote.customer_name}</div>
            <div><strong>Ngày đơn hàng:</strong> ${new Date(quote.quote_date).toLocaleDateString('vi-VN')}</div>
            <div><strong>Giờ:</strong> ${new Date(quote.quote_date).toLocaleTimeString('vi-VN')}</div>
          </div>
          
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Loại sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Loại nhôm</th>
                    <th>Loại kính</th>
                    <th>Loại tay nắm</th>
                    <th>Bộ phận</th>
                    <th>Kích thước</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Chiết khấu</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${quote.items.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? 'Phụ kiện bếp' : 'Tủ bếp'}</td>
                      <td>${item.phukienbep?.ten_phukien || item.sanpham?.tensp || 'N/A'}</td>
                      <td>${item.phukienbep?.loaiphukienbep?.ten_loai || item.sanpham?.ten_nhom || item.ten_nhom || 'N/A'}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? (item.phukienbep?.kich_thuoc || 'N/A') : (item.sanpham?.ten_kinh || item.ten_kinh || 'N/A')}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? 'N/A' : (item.sanpham?.ten_taynam || item.ten_taynam || 'N/A')}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? 'N/A' : (item.sanpham?.ten_bophan || item.ten_bophan || 'N/A')}</td>
                      <td>${item.ngang} x ${item.cao} x ${item.sau} mm</td>
                      <td>${item.so_luong}</td>
                      <td>${item.don_gia?.toLocaleString('vi-VN')} VND</td>
                      <td>${item.chiet_khau || 0}%</td>
                      <td>${item.thanh_tien?.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>          <div class="total">
            <div>Tổng tiền: ${quote.total_amount?.toLocaleString('vi-VN')} VND</div>
          </div>
          
          <div class="footer">
            <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(quoteHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const printAllQuotes = () => {
    if (quotes.length === 0) {
      alert('Không có đơn hàng nào để in');
      return;
    }

    const printWindow = window.open('', '_blank');
    const allQuotesHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Danh sách đơn hàng tháng ${selectedMonth}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .quote { page-break-after: always; margin-bottom: 40px; }
            .quote-info { margin-bottom: 20px; }
            .quote-info div { margin-bottom: 5px; }
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
            <h1>DANH SÁCH ĐƠN HÀNG</h1>
            <h2>Tháng ${selectedMonth}</h2>
          </div>
          
          ${quotes.map(quote => `
            <div class="quote">
              <div class="quote-info">
                <div><strong>Tên khách hàng:</strong> ${quote.customer_name}</div>
                <div><strong>Ngày đơn hàng:</strong> ${new Date(quote.quote_date).toLocaleDateString('vi-VN')}</div>
                <div><strong>Giờ:</strong> ${new Date(quote.quote_date).toLocaleTimeString('vi-VN')}</div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Loại sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Loại nhôm</th>
                    <th>Loại kính</th>
                    <th>Loại tay nắm</th>
                    <th>Bộ phận</th>
                    <th>Kích thước</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Chiết khấu</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${quote.items.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? 'Phụ kiện bếp' : 'Tủ bếp'}</td>
                      <td>${item.phukienbep?.ten_phukien || item.sanpham?.tensp || 'N/A'}</td>
                      <td>${item.phukienbep?.loaiphukienbep?.ten_loai || item.sanpham?.ten_nhom || item.ten_nhom || 'N/A'}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? (item.phukienbep?.kich_thuoc || 'N/A') : (item.sanpham?.ten_kinh || item.ten_kinh || 'N/A')}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? 'N/A' : (item.sanpham?.ten_taynam || item.ten_taynam || 'N/A')}</td>
                      <td>${item.loai_san_pham === 'phukienbep' ? 'N/A' : (item.sanpham?.ten_bophan || item.ten_bophan || 'N/A')}</td>
                      <td>${item.ngang} x ${item.cao} x ${item.sau} mm</td>
                      <td>${item.so_luong}</td>
                      <td>${item.don_gia?.toLocaleString('vi-VN')} VND</td>
                      <td>${item.chiet_khau || 0}%</td>
                      <td>${item.thanh_tien?.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total">
                <div>Tổng tiền: ${quote.total_amount?.toLocaleString('vi-VN')} VND</div>
              </div>
            </div>
          `).join('')}
          
          <div class="month-total">
            Tổng giá trị đơn hàng tháng ${selectedMonth}: ${quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0).toLocaleString('vi-VN')} VND
          </div>
          
          <div class="footer">
            <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(allQuotesHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = () => {
    if (quotes.length === 0) {
      alert('Không có đơn hàng nào để xuất');
      return;
    }

    // Tạo dữ liệu cho Excel
    const excelData = [];
    
    // Header
    excelData.push(['DANH SÁCH ĐƠN HÀNG THÁNG ' + selectedMonth]);
    excelData.push([]);
    excelData.push(['STT', 'Khách hàng', 'Ngày', 'Giờ', 'Loại sản phẩm', 'Tên sản phẩm', 'Loại/Thông số', 'Kích thước', 'Số lượng', 'Đơn giá', 'Chiết khấu', 'Thành tiền', 'Tổng đơn hàng']);

    let rowIndex = 4; // Bắt đầu từ dòng 4 (index 3)
    
    quotes.forEach((quote, quoteIndex) => {
      const quoteDate = new Date(quote.quote_date);
      const dateStr = quoteDate.toLocaleDateString('vi-VN');
      const timeStr = quoteDate.toLocaleTimeString('vi-VN');
      
      if (quote.items && quote.items.length > 0) {
        quote.items.forEach((item, itemIndex) => {
          const isPhuKienBep = item.loai_sanpham === 'phu_kien_bep';
          
          excelData.push([
            quoteIndex + 1, // STT đơn hàng
            quote.customer_name,
            dateStr,
            timeStr,
            isPhuKienBep ? 'Phụ kiện bếp' : 'Tủ bếp', // Loại sản phẩm
            isPhuKienBep 
              ? (item.phukien?.tenphukien || item.tenphukien || 'N/A')
              : (item.sanpham?.tensp || item.tensp || 'N/A'), // Tên sản phẩm
            isPhuKienBep 
              ? (item.phukien?.ten_loai_phukien || item.ten_loai_phukien || 'N/A')
              : (item.sanpham?.ten_nhom || item.ten_nhom || 'N/A'), // Loại/Thông số
            isPhuKienBep 
              ? (item.phukien?.kich_thuoc || item.kich_thuoc || 'N/A')
              : `${item.ngang || 0} x ${item.cao || 0} x ${item.sau || 0} mm`, // Kích thước
            item.so_luong,
            item.don_gia || 0,
            item.chiet_khau || 0,
            item.thanh_tien || 0,
            itemIndex === 0 ? quote.total_amount || 0 : '' // Chỉ hiển thị tổng ở dòng đầu của mỗi đơn hàng
          ]);
        });
      } else {
        // Nếu không có items, vẫn thêm dòng cho đơn hàng
        excelData.push([
          quoteIndex + 1,
          quote.customer_name,
          dateStr,
          timeStr,
          'N/A', // Loại sản phẩm
          'N/A', // Tên sản phẩm
          'N/A', // Loại/Thông số
          'N/A', // Kích thước
          0,
          0,
          0, // Chiết khấu
          0,
          quote.total_amount || 0
        ]);
      }
      
      // Thêm dòng trống giữa các hóa đơn
      excelData.push([]);
      rowIndex += (quote.items?.length || 1) + 1;
    });

    // Thêm tổng kết tháng
    excelData.push([]);
    excelData.push(['', '', '', '', '', '', '', '', 'TỔNG DOANH THU THÁNG:', totalRevenue]);

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Định dạng cột với kích thước đồng bộ hơn
    const colWidths = [
      { wch: 6 },   // STT
      { wch: 25 },  // Khách hàng
      { wch: 12 },  // Ngày
      { wch: 10 },  // Giờ
      { wch: 15 },  // Loại sản phẩm
      { wch: 30 },  // Tên sản phẩm
      { wch: 25 },  // Loại/Thông số
      { wch: 20 },  // Kích thước
      { wch: 12 },  // Số lượng
      { wch: 15 },  // Đơn giá
      { wch: 12 },  // Chiết khấu
      { wch: 15 },  // Thành tiền
      { wch: 18 }   // Tổng đơn hàng
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
        if (col === 0 || col === 8 || col === 9 || col === 10 || col === 11) {
          ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
        } else {
          ws[cellAddress].s.alignment = { horizontal: "left", vertical: "center" };
        }
      }
    }

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'DonHang_Thang_' + selectedMonth);

    // Xuất file
    const fileName = `DanhSach_DonHang_Thang_${selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const totalRevenue = quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);

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
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{quotes.reduce((sum, quote) => sum + (quote.items?.length || 0), 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng giá trị đơn hàng</p>
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
              <p className="text-sm font-medium text-gray-600">Trung bình/đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {quotes.length > 0 ? (totalRevenue / quotes.length).toLocaleString('vi-VN') : 0} VND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Danh sách công trình ({projects.length})
          </h3>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Chưa có công trình nào</p>
            <p className="text-gray-400 text-sm mt-1">Hãy thêm công trình mới để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg line-clamp-1">{project.name_congtrinh}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{project.name_customer}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {project.sdt && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span>{project.sdt}</span>
                      </div>
                    )}
                    {project.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="truncate">{project.email}</span>
                      </div>
                    )}
                    {project.dia_chi && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="truncate">{project.dia_chi}</span>
                      </div>
                    )}
                    {project.ngan_sach_du_kien && (
                      <div className="bg-green-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {parseInt(project.ngan_sach_du_kien).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nhân viên sale */}
                  {project.Id_sale && employees.find(emp => emp.ma_nv === project.Id_sale) && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-purple-700 font-medium">
                          NV: {employees.find(emp => emp.ma_nv === project.Id_sale)?.ho_ten}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mô tả nếu có */}
                  {project.mo_ta && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">{project.mo_ta}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => window.open(`/dashboard/quote/project/${project.id}`, '_blank')}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Xem đơn hàng</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                onClick={loadQuotes}
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
              disabled={quotes.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={printAllQuotes}
              disabled={quotes.length === 0}
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
          <h3 className="text-lg font-semibold text-gray-900">Danh sách đơn hàng tháng {selectedMonth}</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có đơn hàng nào trong tháng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng giá trị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{quote.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(quote.quote_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {quote.total_amount?.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => printQuote(quote)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="In đơn hàng"
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
      {quotes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt tháng {selectedMonth}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{quotes.length}</p>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{quotes.reduce((sum, quote) => sum + (quote.items?.length || 0), 0)}</p>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{totalRevenue.toLocaleString('vi-VN')} VND</p>
              <p className="text-sm text-gray-600">Tổng giá trị</p>
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

      const response = await fetch('http://localhost:8001/api/v1/accounting/quanly_chiphi', {
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

  // Product detail states
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

  // Material data for product details
  const [nhomList, setNhomList] = useState([]);
  const [kinhList, setKinhList] = useState([]);
  const [taynamList, setTaynamList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [sanphamList, setSanphamList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const [nhomRes, kinhRes, taynamRes, bophanRes, productDetailsRes, sanphamRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/accounting/loainhom/'),
        fetch('http://localhost:8001/api/v1/accounting/loaikinh/'),
        fetch('http://localhost:8001/api/v1/accounting/loaitaynam/'),
        fetch('http://localhost:8001/api/v1/accounting/bophan/'),
        fetch('http://localhost:8001/api/v1/accounting/chitietsanpham/'),
        fetch('http://localhost:8001/api/v1/accounting/sanpham/')
      ]);

      if (nhomRes.ok) setNhomList(await nhomRes.json());
      if (kinhRes.ok) setKinhList(await kinhRes.json());
      if (taynamRes.ok) setTaynamList(await taynamRes.json());
      if (bophanRes.ok) setDepartments(await bophanRes.json());
      if (productDetailsRes.ok) setProductDetails(await productDetailsRes.json());
      if (sanphamRes.ok) setSanphamList(await sanphamRes.json());
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Kiểm tra trùng lặp sản phẩm
      const existingProduct = sanphamList.find(p => 
        p.tensp.toLowerCase() === formData.name.toLowerCase() && 
        p.id !== (editingProduct?.id || null)
      );
      
      if (existingProduct) {
        alert('Tên sản phẩm đã tồn tại! Vui lòng chọn tên khác.');
        return;
      }

      // Use the correct endpoint for sanpham table
      const url = editingProduct
        ? `http://localhost:8001/api/v1/accounting/sanpham/${editingProduct.id}`
        : 'http://localhost:8001/api/v1/accounting/sanpham/';

      const method = editingProduct ? 'PUT' : 'POST';

      // Only send the fields that exist in the sanpham table
      const productData = {
        tensp: formData.name,
        id_nhom: editingProduct?.id_nhom || null,
        id_kinh: editingProduct?.id_kinh || null,
        id_taynam: editingProduct?.id_taynam || null,
        id_bophan: editingProduct?.id_bophan || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const result = await response.json();
        if (editingProduct) {
          // Update the product in the sanphamList
          setSanphamList(sanphamList.map(p => p.id === editingProduct.id ? result : p));
        } else {
          // Add new product to sanphamList
          setSanphamList([...sanphamList, result]);
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
    // Get price from product detail if available
    const unitPrice = product.detail && product.detail.don_gia ? product.detail.don_gia.toString() : '';
    const costPrice = unitPrice; // For now, use same price for both fields

    setFormData({
      name: product.tensp || product.name || '',
      unit_price: unitPrice,
      cost_price: costPrice
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use the correct endpoint for sanpham table
      const response = await fetch(`http://localhost:8001/api/v1/accounting/sanpham/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        // Remove from sanphamList
        setSanphamList(sanphamList.filter(p => p.id !== productId));
        // Also remove any related product details
        setProductDetails(productDetails.filter(detail => detail.id_sanpham !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    // Load product details for this product
    const productDetail = productDetails.find(detail => detail.id_sanpham === product.id);
    if (productDetail) {
      setProductDetailForm({
        id_nhom: productDetail.id_nhom || product.id_nhom || '',
        id_kinh: productDetail.id_kinh || product.id_kinh || '',
        id_taynam: productDetail.id_taynam || product.id_taynam || '',
        id_bophan: productDetail.id_bophan || product.id_bophan || '',
        ngang: productDetail.ngang || 0,
        cao: productDetail.cao || 0,
        sau: productDetail.sau || 0,
        don_gia: productDetail.don_gia || 0
      });
    } else {
      // Nếu không có chi tiết sản phẩm, load từ thông tin sản phẩm chính
      setProductDetailForm({
        id_nhom: product.id_nhom || '',
        id_kinh: product.id_kinh || '',
        id_taynam: product.id_taynam || '',
        id_bophan: product.id_bophan || '',
        ngang: 0,
        cao: 0,
        sau: 0,
        don_gia: 0
      });
    }
  };

  const handleProductDetailSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra trùng lặp sản phẩm với cùng loại nhôm, kính, tay nắm và bộ phận
    const existingDetail = productDetails.find(detail => 
      detail.id_nhom === productDetailForm.id_nhom &&
      detail.id_kinh === productDetailForm.id_kinh &&
      detail.id_taynam === productDetailForm.id_taynam &&
      detail.id_bophan === productDetailForm.id_bophan &&
      detail.id_sanpham !== selectedProduct.id
    );
    
    if (existingDetail) {
      alert('Đã tồn tại sản phẩm với cùng loại nhôm, kính, tay nắm và bộ phận! Vui lòng chọn loại khác.');
      return;
    }
    
    try {
      const url = `http://localhost:8001/api/v1/accounting/chitietsanpham/`;
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

      const detailResponse = await fetch(url, {
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

      if (detailResponse.ok) {
        const result = await detailResponse.json();
        // Update product details in state
        const updatedDetails = productDetails.filter(detail => detail.id_sanpham !== selectedProduct.id);
        setProductDetails([...updatedDetails, result]);
        
        // Also update the product in sanphamList with the new material info
        const updatedSanphamList = sanphamList.map(p => {
          if (p.id === selectedProduct.id) {
            return {
              ...p,
              id_nhom: productDetailForm.id_nhom,
              id_kinh: productDetailForm.id_kinh,
              id_taynam: productDetailForm.id_taynam,
              id_bophan: productDetailForm.id_bophan
            };
          }
          return p;
        });
        setSanphamList(updatedSanphamList);
        
        alert('Chi tiết sản phẩm đã được cập nhật thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật chi tiết sản phẩm');
      }
    } catch (error) {
      console.error('Error saving product detail:', error);
      alert('Có lỗi xảy ra khi cập nhật chi tiết sản phẩm');
    }
  };

  const getCombinedProducts = () => {
    return sanphamList.map(sanpham => {
      const detail = productDetails.find(detail => detail.id_sanpham === sanpham.id);
      return {
        ...sanpham,
        detail: detail || null,
        // Thêm thông tin từ các bảng liên quan
        ten_nhom: detail ? nhomList.find(n => n.id === detail.id_nhom)?.tenloai : nhomList.find(n => n.id === sanpham.id_nhom)?.tenloai,
        ten_kinh: detail ? kinhList.find(k => k.id === detail.id_kinh)?.tenloai : kinhList.find(k => k.id === sanpham.id_kinh)?.tenloai,
        ten_taynam: detail ? taynamList.find(t => t.id === detail.id_taynam)?.tenloai : taynamList.find(t => t.id === sanpham.id_taynam)?.tenloai,
        ten_bophan: detail ? departments.find(b => b.id === detail.id_bophan)?.tenloai : departments.find(b => b.id === sanpham.id_bophan)?.tenloai
      };
    });
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu sản phẩm...</div>;
  }

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

      {/* Product Detail Form */}
      {selectedProduct && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Chỉnh sửa chi tiết sản phẩm: {selectedProduct.tensp}
            </h3>
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleProductDetailSubmit} className="space-y-6">
            {/* Hiển thị tên sản phẩm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
              <input
                type="text"
                value={selectedProduct.tensp}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
                readOnly
              />
            </div>

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
                onClick={() => setSelectedProduct(null)}
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
      )}

      {/* Add/Edit Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc (VND)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Nhập giá gốc"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormData({ name: '', unit_price: '', cost_price: '' });
                }}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCombinedProducts().map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{product.tensp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {product.detail ? product.detail.don_gia?.toLocaleString('vi-VN') : 'N/A'} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.detail ? `${product.detail.ngang} x ${product.detail.cao} x ${product.detail.sau} mm` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleProductClick(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Chỉnh sửa chi tiết"
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
              ))}
            </tbody>
          </table>
        </div>
        {getCombinedProducts().length === 0 && (
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
  const [loaiphukienbepList, setLoaiphukienbepList] = useState([]);
  const [phukienbepList, setPhukienbepList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tenloai: '',
    mota: '',
    // For phukienbep
    id_loaiphukien: '',
    ten_phukien: '',
    gia: 0,
    kich_thuoc: '',
    thuong_hieu: '',
    mo_ta: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({});
  const [editingLoaiPhukien, setEditingLoaiPhukien] = useState(null);
  const [inlineEditLoaiPhukienData, setInlineEditLoaiPhukienData] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const [nhomRes, kinhRes, taynamRes, bophanRes, loaiphukienRes, phukienRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/accounting/loainhom/'),
        fetch('http://localhost:8001/api/v1/accounting/loaikinh/'),
        fetch('http://localhost:8001/api/v1/accounting/loaitaynam/'),
        fetch('http://localhost:8001/api/v1/accounting/bophan/'),
        fetch('http://localhost:8001/api/v1/accounting/loaiphukienbep/'),
        fetch('http://localhost:8001/api/v1/accounting/phukienbep/')
      ]);

      if (nhomRes.ok) {
        const nhomData = await nhomRes.json();
        setNhomList(nhomData);
      }
      if (kinhRes.ok) {
        const kinhData = await kinhRes.json();
        setKinhList(kinhData);
      }
      if (taynamRes.ok) {
        const taynamData = await taynamRes.json();
        setTaynamList(taynamData);
      }
      if (bophanRes.ok) {
        const bophanData = await bophanRes.json();
        setDepartments(bophanData);
      }
      if (loaiphukienRes.ok) {
        const loaiphukienData = await loaiphukienRes.json();
        setLoaiphukienbepList(loaiphukienData);
      }
      if (phukienRes.ok) {
        const phukienData = await phukienRes.json();
        setPhukienbepList(phukienData);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo danh sách loại phụ kiện từ bảng phukienbep
  const getLoaiPhukienFromPhukienbep = () => {
    const uniqueLoaiIds = [...new Set(phukienbepList.map(item => item.id_loaiphukien).filter(id => id))];
    
    const result = uniqueLoaiIds.map(id => {
      const loaiInfo = loaiphukienbepList.find(loai => loai.id === id);
      return {
        id: id,
        tenloai: loaiInfo ? loaiInfo.tenloai : `Loại ${id}`
      };
    });
    
    return result;
  };

  const getCurrentList = () => {
    switch (activeMaterialTab) {
      case 'nhom': return nhomList;
      case 'kinh': return kinhList;
      case 'taynam': return taynamList;
      case 'departments': return departments;
      case 'loaiphukienbep': return getLoaiPhukienFromPhukienbep();
      case 'phukienbep': return phukienbepList;
      default: return [];
    }
  };

  const getCurrentSetter = () => {
    switch (activeMaterialTab) {
      case 'nhom': return setNhomList;
      case 'kinh': return setKinhList;
      case 'taynam': return setTaynamList;
      case 'departments': return setDepartments;
      case 'loaiphukienbep': return setLoaiphukienbepList;
      case 'phukienbep': return setPhukienbepList;
      default: return () => {};
    }
  };

  const getApiEndpoint = () => {
    switch (activeMaterialTab) {
      case 'nhom': return 'loainhom';
      case 'kinh': return 'loaikinh';
      case 'taynam': return 'loaitaynam';
      case 'departments': return 'bophan';
      case 'loaiphukienbep': return 'loaiphukienbep';
      case 'phukienbep': return 'phukienbep';
      default: return '';
    }
  };

  const getMaterialTitle = () => {
    switch (activeMaterialTab) {
      case 'nhom': return 'Loại nhôm';
      case 'kinh': return 'Loại kính';
      case 'taynam': return 'Loại tay nắm';
      case 'departments': return 'Bộ phận';
      case 'loaiphukienbep': return 'Loại phụ kiện bếp';
      case 'phukienbep': return 'Phụ kiện bếp';
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = getApiEndpoint();
      const url = editingItem 
        ? `http://localhost:8001/api/v1/accounting/${endpoint}/${editingItem.id}`
        : `http://localhost:8001/api/v1/accounting/${endpoint}/`;
      
      const method = editingItem ? 'PUT' : 'POST';

      let requestData;
      if (activeMaterialTab === 'phukienbep') {
        requestData = {
          id_loaiphukien: parseInt(formData.id_loaiphukien),
          tenphukien: formData.ten_phukien,
          don_gia: parseFloat(formData.don_gia),
          kich_thuoc: formData.kich_thuoc,
          thuong_hieu: formData.thuong_hieu,
          mo_ta: formData.mo_ta
        };
      } else {
        requestData = {
          tenloai: formData.tenloai,
          mota: formData.mota
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
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
        
        setFormData({
          tenloai: '',
          mota: '',
          id_loaiphukien: '',
          tenphukien: '',
          don_gia: 0,
          kich_thuoc: '',
          thuong_hieu: '',
          mo_ta: ''
        });
        setShowForm(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const handleEdit = (item) => {
    if (activeMaterialTab === 'phukienbep') {
      // Inline editing cho phụ kiện bếp
      setEditingItem(item.id);
      setInlineEditData({
        id_loaiphukien: item.id_loaiphukien || '',
        tenphukien: item.tenphukien || '',
        don_gia: item.don_gia || 0,
        kich_thuoc: item.kich_thuoc || '',
        thuong_hieu: item.thuong_hieu || '',
        mo_ta: item.mo_ta || ''
      });
    } else if (activeMaterialTab === 'loaiphukienbep') {
      // Đối với tab loaiphukienbep, item chỉ có id và tenloai, cần tìm full item từ loaiphukienbepList
      const fullItem = loaiphukienbepList.find(loai => loai.id === item.id);
      if (fullItem) {
        setFormData({
          tenloai: fullItem.tenloai,
          mota: fullItem.mota || ''
        });
      }
      setShowForm(true);
      setEditingItem(item);
    } else {
      setFormData({
        tenloai: item.tenloai,
        mota: item.mota || ''
      });
      setShowForm(true);
      setEditingItem(item);
    }
  };

  const handleInlineSave = async (itemId) => {
    try {
      const url = `http://localhost:8001/api/v1/accounting/phukienbep/${itemId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_loaiphukien: parseInt(inlineEditData.id_loaiphukien),
          tenphukien: inlineEditData.tenphukien,
          don_gia: parseFloat(inlineEditData.don_gia),
          kich_thuoc: inlineEditData.kich_thuoc,
          thuong_hieu: inlineEditData.thuong_hieu,
          mo_ta: inlineEditData.mo_ta
        })
      });

      if (response.ok) {
        const result = await response.json();
        const currentList = getCurrentList();
        const setter = getCurrentSetter();
        setter(currentList.map(item => item.id === itemId ? result : item));
        setEditingItem(null);
        setInlineEditData({});
      }
    } catch (error) {
      console.error('Error saving inline edit:', error);
    }
  };

  const handleInlineCancel = () => {
    setEditingItem(null);
    setInlineEditData({});
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;

    try {
      const endpoint = getApiEndpoint();
      const response = await fetch(`http://localhost:8001/api/v1/accounting/${endpoint}/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const setter = getCurrentSetter();
        const currentList = getCurrentList();
        setter(currentList.filter(item => item.id !== itemId));
        
        // Nếu xóa loại phụ kiện bếp, cần refresh lại danh sách phụ kiện bếp
        if (activeMaterialTab === 'loaiphukienbep') {
          // Kiểm tra xem loại này có được sử dụng trong phụ kiện bếp không
          const isUsedInPhukien = phukienbepList.some(phukien => phukien.id_loaiphukien === itemId);
          if (isUsedInPhukien) {
            // Refresh lại danh sách phụ kiện để cập nhật dropdown
            const phukienRes = await fetch('http://localhost:8001/api/v1/accounting/phukienbep/');
            if (phukienRes.ok) {
              setPhukienbepList(await phukienRes.json());
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      tenloai: '',
      mota: '',
      id_loaiphukien: '',
      tenphukien: '',
      don_gia: 0,
      kich_thuoc: '',
      thuong_hieu: '',
      mo_ta: ''
    });
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
          <p className="text-gray-600 mt-1">Quản lý các loại nhôm, kính, tay nắm, bộ phận và phụ kiện bếp</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng {getMaterialTitle().toLowerCase()}</p>
            <p className="text-xl font-bold text-purple-600">
              {activeMaterialTab === 'loaiphukienbep' ? getLoaiPhukienFromPhukienbep().length : getCurrentList().length}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeMaterialTab === 'phukienbep' 
                ? 'Thêm phụ kiện bếp' 
                : activeMaterialTab === 'loaiphukienbep'
                ? 'Thêm loại phụ kiện bếp'
                : `Thêm ${getMaterialTitle().toLowerCase()}`}
            </span>
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
              { id: 'loaiphukienbep', label: 'Loại phụ kiện bếp', count: getLoaiPhukienFromPhukienbep().length },
              { id: 'phukienbep', label: 'Phụ kiện bếp', count: phukienbepList.length }
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
              {activeMaterialTab === 'phukienbep' ? (
                // Form for Phụ kiện bếp
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Loại phụ kiện bếp <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.id_loaiphukien}
                        onChange={(e) => setFormData({...formData, id_loaiphukien: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-white"
                        required
                      >
                        <option value="">-- Chọn loại phụ kiện bếp --</option>
                        {getLoaiPhukienFromPhukienbep().length === 0 ? (
                          <option value="" disabled>Không có loại phụ kiện nào. Hãy thêm phụ kiện trước.</option>
                        ) : (
                          getLoaiPhukienFromPhukienbep().map(loai => (
                            <option key={loai.id} value={loai.id}>
                              {loai.tenloai}
                            </option>
                          ))
                        )}
                      </select>
                      {getLoaiPhukienFromPhukienbep().length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          ⚠️ Cần thêm ít nhất một phụ kiện để có loại phụ kiện
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Tên phụ kiện bếp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Bếp từ Electrolux, Lò nướng Bosch..."
                        value={formData.tenphukien}
                        onChange={(e) => setFormData({...formData, tenphukien: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Giá (VND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={formData.don_gia}
                        onChange={(e) => setFormData({...formData, don_gia: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Kích thước
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 60x52x5 cm"
                        value={formData.kich_thuoc}
                        onChange={(e) => setFormData({...formData, kich_thuoc: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Thương hiệu
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Electrolux, Bosch..."
                        value={formData.thuong_hieu || ''}
                        onChange={(e) => setFormData({...formData, thuong_hieu: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Mô tả chi tiết
                    </label>
                    <textarea
                      placeholder="Mô tả chi tiết về phụ kiện bếp, tính năng, thông số kỹ thuật..."
                      value={formData.mo_ta}
                      onChange={(e) => setFormData({...formData, mo_ta: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                      rows="4"
                    />
                  </div>
                </div>
              ) : (
                // Form for other materials (nhom, kinh, taynam, departments, loaiphukienbep)
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
                  {activeMaterialTab === 'phukienbep' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên phụ kiện
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại phụ kiện
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá & Kích thước
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </>
                  ) : activeMaterialTab === 'loaiphukienbep' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên loại phụ kiện
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentList().map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {activeMaterialTab === 'phukienbep' ? (
                      editingItem === item.id ? (
                        // Inline editing form
                        <>
                          <td className="px-6 py-4" colSpan="5">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-blue-900 mb-3">Chỉnh sửa phụ kiện bếp</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-blue-700 mb-1">
                                    Loại phụ kiện bếp <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={inlineEditData.id_loaiphukien}
                                    onChange={(e) => setInlineEditData({...inlineEditData, id_loaiphukien: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                                    required
                                  >
                                    <option value="">-- Chọn loại --</option>
                                    {getLoaiPhukienFromPhukienbep().map(loai => (
                                      <option key={loai.id} value={loai.id}>
                                        {loai.tenloai}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-blue-700 mb-1">
                                    Tên phụ kiện <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={inlineEditData.tenphukien}
                                    onChange={(e) => setInlineEditData({...inlineEditData, tenphukien: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-blue-700 mb-1">
                                    Giá (VND) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={inlineEditData.don_gia}
                                    onChange={(e) => setInlineEditData({...inlineEditData, don_gia: parseFloat(e.target.value) || 0})}
                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-blue-700 mb-1">
                                    Kích thước
                                  </label>
                                  <input
                                    type="text"
                                    value={inlineEditData.kich_thuoc}
                                    onChange={(e) => setInlineEditData({...inlineEditData, kich_thuoc: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-blue-700 mb-1">
                                    Thương hiệu
                                  </label>
                                  <input
                                    type="text"
                                    value={inlineEditData.thuong_hieu}
                                    onChange={(e) => setInlineEditData({...inlineEditData, thuong_hieu: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                  />
                                </div>
                                <div className="flex items-end space-x-2">
                                  <button
                                    onClick={() => handleInlineSave(item.id)}
                                    className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Lưu
                                  </button>
                                  <button
                                    onClick={handleInlineCancel}
                                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Hủy
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3">
                                <label className="block text-xs font-medium text-blue-700 mb-1">
                                  Mô tả chi tiết
                                </label>
                                <textarea
                                  value={inlineEditData.mo_ta}
                                  onChange={(e) => setInlineEditData({...inlineEditData, mo_ta: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                  rows="2"
                                />
                              </div>
                            </div>
                          </td>
                        </>
                      ) : (
                        // Normal display
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.tenphukien || 'Chưa có tên'}
                                </div>
                                {item.thuong_hieu && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    {item.thuong_hieu}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">
                                  ID: {item.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {getLoaiPhukienFromPhukienbep().find(loai => loai.id === item.id_loaiphukien)?.tenloai || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              {item.don_gia ? item.don_gia.toLocaleString('vi-VN') : '0'} VND
                            </div>
                            {item.kich_thuoc && (
                              <div className="text-xs text-gray-500">
                                Kích thước: {item.kich_thuoc}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {item.mo_ta || 'Không có mô tả'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-150"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-150"
                                title="Xóa"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Xóa
                              </button>
                            </div>
                          </td>
                        </>
                      )
                    ) : activeMaterialTab === 'loaiphukienbep' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Settings className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.tenloai || 'Chưa có tên'}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {item.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {loaiphukienbepList.find(loai => loai.id === item.id)?.mota || 'Không có mô tả'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(loaiphukienbepList.find(loai => loai.id === item.id))}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-150"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-150"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Settings className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.tenloai || 'Chưa có tên'}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {item.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {item.mota || 'Không có mô tả'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-150"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-150"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Xóa
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
            <p className="text-sm text-gray-400 mt-1">
              {activeMaterialTab === 'phukienbep' 
                ? 'Thêm phụ kiện bếp đầu tiên để bắt đầu' 
                : activeMaterialTab === 'loaiphukienbep'
                ? 'Thêm phụ kiện bếp trước để có loại phụ kiện'
                : `Thêm ${getMaterialTitle().toLowerCase()} đầu tiên để bắt đầu`}
            </p>
          </div>
        )}
      </div>
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
        ? `http://localhost:8001/api/v1/accounting/loaichiphi/${editingCategory.id}`
        : 'http://localhost:8001/api/v1/accounting/loaichiphi/';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ten_loai: formData.name,
          loai_phi: formData.type,
          mo_ta: ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (editingCategory) {
          setExpenseCategories(expenseCategories.map(c => c.id === editingCategory.id ? result : c));
        } else {
          setExpenseCategories([...expenseCategories, result]);
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
      name: category.ten_loai,
      type: category.loai_phi
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:8001/api/v1/accounting/loaichiphi/${categoryId}`, {
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
                      <span className="text-sm font-medium text-gray-900">{category.ten_loai}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      category.loai_phi === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {category.loai_phi === 'fixed' ? 'Cố định' : 'Biến động'}
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

function ExpensesManagementTab() {
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    id_lcp: '',
    giathanh: '',
    mo_ta: 'dự toán',
    parent_id: '',
    created_at: new Date().toISOString().split('T')[0]
  });
  const [availableParents, setAvailableParents] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchExpenseCategories();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectExpenses();
    } else {
      setExpenses([]);
      setLoading(false);
    }
  }, [selectedProject, selectedMonth]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/quote/cong_trinh/');
      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/accounting/loaichiphi/');
      if (response.ok) {
        const data = await response.json();
        setExpenseCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  const loadProjectExpenses = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/chiphi_quote/project/${selectedProject}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('Error loading project expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const saveProjectExpense = async () => {
    if (!selectedProject) {
      alert('Vui lòng chọn công trình trước khi thêm chi phí');
      return;
    }

    if (!expenseForm.id_lcp) {
      alert('Vui lòng chọn loại chi phí');
      return;
    }

    try {
      const expenseData = {
        id_lcp: parseInt(expenseForm.id_lcp),
        giathanh: parseFloat(expenseForm.giathanh) || null,
        mo_ta: expenseForm.mo_ta || 'dự toán',
        parent_id: expenseForm.parent_id ? parseInt(expenseForm.parent_id) : null,
        created_at: expenseForm.created_at,
        id_congtrinh: parseInt(selectedProject)
      };

      const url = editingExpense
        ? `http://localhost:8001/api/v1/accounting/chiphi_quote/${editingExpense.id}`
        : 'http://localhost:8001/api/v1/accounting/chiphi_quote/';

      const method = editingExpense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        alert(editingExpense ? 'Cập nhật chi phí thành công!' : 'Thêm chi phí thành công!');
        loadProjectExpenses();
        setExpenseForm({
          id_lcp: '',
          giathanh: '',
          mo_ta: 'dự toán',
          parent_id: '',
          created_at: new Date().toISOString().split('T')[0]
        });
        setEditingExpense(null);
        setShowExpenseForm(false);
      } else {
        const errorData = await response.json();
        alert(`Có lỗi xảy ra: ${errorData.detail || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Có lỗi xảy ra khi lưu chi phí');
    }
  };

  const deleteProjectExpense = async (expenseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/accounting/chiphi_quote/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa chi phí thành công!');
        loadProjectExpenses();
      } else {
        alert('Có lỗi xảy ra khi xóa chi phí');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Có lỗi xảy ra khi xóa chi phí');
    }
  };

  const editProjectExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      id_lcp: expense.id_lcp?.toString() || '',
      giathanh: expense.giathanh ? expense.giathanh.toString() : '',
      mo_ta: expense.mo_ta || 'dự toán',
      parent_id: expense.parent_id?.toString() || '',
      created_at: expense.created_at ? new Date(expense.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowExpenseForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="text-gray-600 ml-3">Đang tải dữ liệu chi phí...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Chi phí Công trình</h2>
          <p className="text-gray-600 mt-1">Thêm và quản lý chi phí cho công trình đã chọn</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng chi phí</p>
            <p className="text-xl font-bold text-red-600">
              {expenses.reduce((sum, expense) => sum + (expense.giathanh || 0), 0).toLocaleString('vi-VN')} VND
            </p>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn công trình</h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Công trình</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
          >
            <option value="">Chọn công trình để xem chi phí</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name_congtrinh} - {project.name_customer}
              </option>
            ))}
          </select>
          {!selectedProject && (
            <p className="text-sm text-gray-600 mt-2">
              💡 Chọn công trình để xem và quản lý chi phí của công trình đó
            </p>
          )}
        </div>
      </div>

      {/* Add Expense Button */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thêm chi phí mới</h3>
              <p className="text-gray-600 mt-1">Thêm loại chi phí và chi phí cho công trình đã chọn</p>
            </div>
            <button
              onClick={() => {
                setShowExpenseForm(true);
                setEditingExpense(null);
                setExpenseForm({
                  id_lcp: '',
                  giathanh: '',
                  mo_ta: 'dự toán',
                  parent_id: '',
                  created_at: new Date().toISOString().split('T')[0]
                });
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm chi phí</span>
            </button>
          </div>
        </div>
      )}

      {/* Expense Form */}
      {showExpenseForm && selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingExpense ? 'Sửa chi phí' : 'Thêm chi phí mới'}
            </h3>
            <button
              onClick={() => setShowExpenseForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại chi phí *</label>
              <select
                value={expenseForm.id_lcp}
                onChange={(e) => setExpenseForm({...expenseForm, id_lcp: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                required
              >
                <option value="">Chọn loại chi phí</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.tenchiphi}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={expenseForm.giathanh}
                onChange={(e) => setExpenseForm({...expenseForm, giathanh: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="Nhập số tiền"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <input
                type="text"
                value={expenseForm.mo_ta}
                onChange={(e) => setExpenseForm({...expenseForm, mo_ta: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                placeholder="Nhập mô tả chi phí"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
              <input
                type="date"
                value={expenseForm.created_at}
                onChange={(e) => setExpenseForm({...expenseForm, created_at: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowExpenseForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={saveProjectExpense}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingExpense ? 'Cập nhật' : 'Lưu'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách chi phí công trình</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại chi phí</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {expense.loaichiphi?.ten_loai || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{expense.ten_chi_phi || expense.mo_ta}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {(expense.giathanh || 0).toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.created_at ? new Date(expense.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editProjectExpense(expense)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProjectExpense(expense.id)}
                          className="text-red-600 hover:text-red-900"
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
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có chi phí nào cho công trình này</p>
              <p className="text-gray-400 text-sm mt-1">Nhấn "Thêm chi phí" để bắt đầu</p>
            </div>
          )}
        </div>
      )}

      {!selectedProject && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn công trình để xem chi phí</h3>
          <p className="text-gray-600">Vui lòng chọn một công trình từ danh sách ở trên để xem và quản lý chi phí.</p>
        </div>
      )}
    </div>
  );
}
