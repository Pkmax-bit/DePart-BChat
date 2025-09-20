import React, { useState, useEffect } from 'react';
import { Plus, Package, RefreshCw, Trash2, Save, DollarSign, Edit, X, Building2, ArrowRight } from 'lucide-react';

const InvoiceItems = ({
  selectedProductType,
  setSelectedProductType,
  selectedBophans,
  setSelectedBophans,
  globalNhom,
  setGlobalNhom,
  globalKinh,
  setGlobalKinh,
  globalTaynam,
  setGlobalTaynam,
  invoiceItems,
  setInvoiceItems,
  bophanList,
  loainhomList,
  loaikinhList,
  loaitaynamList,
  sanphamList,
  chitietsanphamList,
  loaiphukienList,
  phukienList,
  selectedProject,
  projectExpenses,
  setProjectExpenses,
  showCostForm,
  setShowCostForm,
  editingExpense,
  setEditingExpense,
  costForm,
  setCostForm,
  expenseCategories,
  availableParents,
  saveProjectExpense,
  deleteProjectExpense,
  editProjectExpense,
  renderHierarchicalExpenses,
  calculateTotal,
  saveInvoice
}) => {
  const [selectedBophanDetails, setSelectedBophanDetails] = useState({});

  const toggleBophan = (bophanId) => {
    if (selectedBophans.includes(bophanId)) {
      setSelectedBophans(selectedBophans.filter(id => id !== bophanId));
      // Remove the invoice item for this department
      setInvoiceItems(invoiceItems.filter(item => item.id_bophan !== bophanId));
    } else {
      setSelectedBophans([...selectedBophans, bophanId]);
      // Add a new invoice item for this department
      const newItem = {
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
      setInvoiceItems([...invoiceItems, newItem]);
    }
  };

  const applyGlobalSelections = () => {
    const updatedItems = invoiceItems.map(item => ({
      ...item,
      id_nhom: globalNhom || item.id_nhom,
      id_kinh: globalKinh || item.id_kinh,
      id_taynam: globalTaynam || item.id_taynam
    }));
    setInvoiceItems(updatedItems);
  };

  const updateInvoiceItem = (itemId, field, value) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };

        // Calculate derived values
        if (field === 'ngang' || field === 'cao' || field === 'sau' || field === 'don_gia' || field === 'so_luong' || field === 'chiet_khau') {
          const ngang = field === 'ngang' ? value : updatedItem.ngang;
          const cao = field === 'cao' ? value : updatedItem.cao;
          const sau = field === 'sau' ? value : updatedItem.sau;
          const donGia = field === 'don_gia' ? value : updatedItem.don_gia;
          const soLuong = field === 'so_luong' ? value : updatedItem.so_luong;
          const chietKhau = field === 'chiet_khau' ? value : updatedItem.chiet_khau;

          updatedItem.dien_tich_ke_hoach = ngang * cao;
          updatedItem.dien_tich_thuc_te = ngang * cao * sau;
          updatedItem.ti_le = updatedItem.dien_tich_thuc_te > 0 ? (updatedItem.dien_tich_ke_hoach / updatedItem.dien_tich_thuc_te) * 100 : 0;
          const giaTruocCK = updatedItem.ti_le * donGia * soLuong / 100;
          updatedItem.thanh_tien = giaTruocCK * (1 - (chietKhau || 0) / 100);
        }

        return updatedItem;
      }
      return item;
    });
    setInvoiceItems(updatedItems);
  };

  const addInvoiceItem = () => {
    if (selectedProductType === 'phu_kien_bep') {
      const newItem = {
        id: Date.now(),
        loai_san_pham: 'phu_kien_bep',
        id_loaiphukien: '',
        id_phukien: '',
        so_luong: 1,
        don_gia: 0,
        chiet_khau: 0,
        thanh_tien: 0
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
  };

  const removeInvoiceItem = (itemId) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  const loadBophanData = (bophanId) => {
    // This function would load data for the specific department
    console.log('Loading data for bophan:', bophanId);
  };

  return (
    <div className="space-y-6">
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
          </div>
        </div>

        {/* Chọn bộ phận */}
        {selectedProductType === 'tu_bep' && (
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
        )}

        {/* Chọn loại vật liệu chung */}
        {selectedBophans.length > 0 && selectedProductType === 'tu_bep' && (
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
                              // Cập nhật các trường select cho loại nhôm, kính, tay nắm
                              updateInvoiceItem(item.id, 'id_nhom', foundDetail.id_nhom || selectedSanpham.id_nhom || globalNhom);
                              updateInvoiceItem(item.id, 'id_kinh', foundDetail.id_kinh || selectedSanpham.id_kinh || globalKinh);
                              updateInvoiceItem(item.id, 'id_taynam', foundDetail.id_taynam || selectedSanpham.id_taynam || globalTaynam);

                              updateInvoiceItem(item.id, 'sanpham_id', selectedSanpham.id);
                              updateInvoiceItem(item.id, 'ngang', foundDetail.ngang);
                              updateInvoiceItem(item.id, 'cao', foundDetail.cao);
                              updateInvoiceItem(item.id, 'sau', foundDetail.sau);
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

        {selectedBophans.length === 0 && selectedProductType === 'tu_bep' && (
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
                            mo_ta: '',
                            status: 'dự toán',
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <input
                          type="text"
                          value="dự toán"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
                          readOnly
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
                              mo_ta: '',
                              status: 'dự toán',
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
                renderHierarchicalExpenses(projectExpenses)
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
};

export default InvoiceItems;