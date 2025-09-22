import React, { useState, useMemo } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  CheckCircle,
  FileText,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Search
} from 'lucide-react';

const ProjectSection = ({
  projects,
  employees,
  showProjectInputs,
  setShowProjectInputs,
  congTrinh,
  setCongTrinh,
  showInlineEditForm,
  setShowInlineEditForm,
  editingProjectInline,
  setEditingProjectInline,
  showProjectModal,
  setShowProjectModal,
  editingProject,
  selectedProject,
  handleProjectSelection,
  handleViewProjectQuotes,
  deleteProject,
  saveProjectInfo
}) => {
  const [filterName, setFilterName] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterPhone, setFilterPhone] = useState('');

  // Lọc projects dựa trên các bộ lọc
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const nameMatch = filterName === '' || 
        project.name_congtrinh?.toLowerCase().includes(filterName.toLowerCase());
      const customerMatch = filterCustomer === '' || 
        project.name_customer?.toLowerCase().includes(filterCustomer.toLowerCase());
      const phoneMatch = filterPhone === '' || 
        String(project.sdt || '').includes(filterPhone);
      
      return nameMatch && customerMatch && phoneMatch;
    });
  }, [projects, filterName, filterCustomer, filterPhone]);

  return (
    <>
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
            Danh sách công trình ({filteredProjects.length}{projects.length !== filteredProjects.length ? `/${projects.length}` : ''})
          </h4>

          {/* Bộ lọc */}
          <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-3">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Tìm kiếm và lọc công trình</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tên công trình</label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  placeholder="Nhập tên công trình..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  placeholder="Nhập tên khách hàng..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
            </div>
            {(filterName || filterCustomer || filterPhone) && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Đang lọc: {filteredProjects.length} kết quả
                </span>
                <button
                  onClick={() => {
                    setFilterName('');
                    setFilterCustomer('');
                    setFilterPhone('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {projects.length === 0 ? 'Chưa có công trình nào' : 'Không tìm thấy công trình phù hợp'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {projects.length === 0 ? 'Hãy thêm công trình mới để bắt đầu' : 'Hãy thử điều chỉnh bộ lọc'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map(project => (
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
                              <span className="max-w-96 break-words">{project.dia_chi}</span>
                            </div>
                          )}
                          {project.ngan_sach_du_kien && (
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                              <span className="text-sm font-medium text-green-700">
                                {parseInt(project.ngan_sach_du_kien).toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                          )}
                          {project.ngan_sach_ke_hoach && (
                            <div className="bg-blue-50 px-3 py-1 rounded-full">
                              <span className="text-sm font-medium text-blue-700">
                                Kế hoạch: {parseInt(project.ngan_sach_ke_hoach).toLocaleString('vi-VN')} VND
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
                            <span className="break-words">{project.dia_chi}</span>
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
                        {project.ngan_sach_ke_hoach && (
                          <div className="col-span-2 mt-2">
                            <div className="bg-blue-50 px-3 py-2 rounded-lg inline-block">
                              <span className="text-sm font-medium text-blue-700">
                                Kế hoạch: {parseInt(project.ngan_sach_ke_hoach).toLocaleString('vi-VN')} VND
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
            {filteredProjects.map(project => (
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
    </>
  );
};

export default ProjectSection;