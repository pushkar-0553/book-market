import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import MarkExitedModal from '../components/MarkExitedModal';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal';
import {
  HiOutlineSearch, HiOutlinePencilAlt, HiOutlineChevronLeft, 
  HiOutlineChevronRight, HiOutlinePlus, HiOutlineUsers, 
  HiOutlineCalendar, HiOutlineClipboardList, HiOutlineRefresh,
  HiOutlineLogout, HiOutlineEye
} from 'react-icons/hi';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // UI Tab state: ACTIVE or HISTORY
  const [exitTarget, setExitTarget] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      // API Tab mapping: ACTIVE -> status=true, HISTORY -> status=all
      const statusParam = activeTab === 'ACTIVE' ? 'true' : 'all';
      const { data } = await API.get(`/employees?search=${search}&page=${page}&limit=8&status=${statusParam}`);
      setEmployees(data.employees || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [search, page, activeTab]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    document.title = (activeTab === 'ACTIVE' ? 'Working Employees' : 'Employee History') + ' | Employee Management';
  }, [activeTab]);

  const handleMarkAsExited = async (data) => {
    try {
      await API.put(`/employees/${exitTarget.id}/exit`, data);
      toast.success('Employee moved to History');
      setExitTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this employee to ACTIVE status?')) return;
    try {
      await API.put(`/employees/${id}/restore`);
      toast.success('Employee restored successfully');
      fetchEmployees();
    } catch (err) {
      toast.error('Restore failed');
    }
  };

  const headerStyle = {
    padding: '14px 20px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc'
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px', marginLeft: "50px", marginTop: '80px' }}>
      
      {/* Header with Search */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>Employee Directory</h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
                {activeTab === 'ACTIVE' ? 'Currently active team members' : 'Full organizational history and logs'}
            </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
                <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                <input
                type="text"
                placeholder="Search name, ID, or role..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-base"
                style={{ paddingLeft: '38px', width: '260px', height: '42px', fontSize: '13.5px' }}
                />
            </div>
            {activeTab === 'ACTIVE' && (
                <Link to="/add-employee" className="btn-primary" style={{ height: '42px', padding: '0 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlinePlus size={18} /> Add Employee
                </Link>
            )}
            </div>
        </div>

        {/* Tabs Segmented Control */}
        <div style={{ 
            marginTop: '24px',
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '12px', 
            width: 'fit-content',
            border: '1.5px solid #e2e8f0'
        }}>
            {[
            { id: 'ACTIVE', label: 'Working Employees', icon: HiOutlineUsers },
            { id: 'HISTORY', label: 'History (All Records)', icon: HiOutlineClipboardList }
            ].map(tab => (
            <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '9px',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                }}
            >
                <tab.icon size={16} /> {tab.label}
            </button>
            ))}
        </div>
      </div>

      {/* Table Content Area */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Employee Info</th>
              <th style={headerStyle}>Designation</th>
              <th style={headerStyle}>{activeTab === 'ACTIVE' ? 'Joined On' : 'Status & Logs'}</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div className="spinner spinner-dark" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Fetching records...</p>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div style={{ color: '#cbd5e1', marginBottom: '12px' }}><HiOutlineSearch size={40} /></div>
                  <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>No records found</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Try adjusting your search or filters.</p>
                </td>
              </tr>
            ) : employees.map((emp) => (
              <tr key={emp.id} className="table-row">
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div 
                      onClick={() => setSelectedEmployee(emp)}
                      style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '13px', fontWeight: 800, flexShrink: 0,
                        cursor: 'pointer', boxShadow: '0 4px 10px -2px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      {emp.profile_picture 
                        ? <img src={emp.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} alt="" />
                        : `${emp.first_name[0]}${emp.last_name[0]}`
                      }
                    </div>
                    <div>
                      <p 
                        onClick={() => setSelectedEmployee(emp)}
                        style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '2px', cursor: 'pointer' }}
                      >
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p 
                        onClick={() => setSelectedEmployee(emp)}
                        style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', cursor: 'pointer' }}
                      >
                         #{emp.emp_id} • {emp.blood_group}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{emp.role}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department Dept.</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  {activeTab === 'ACTIVE' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                      <HiOutlineCalendar size={16} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>
                        {new Date(emp.date_of_joining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ 
                        color: emp.status === 1 ? '#059669' : '#dc2626', 
                        background: emp.status === 1 ? '#ecfdf5' : '#fef2f2',
                        fontSize: '10.5px', fontWeight: 700, padding: '2px 10px', 
                        borderRadius: '20px', width: 'fit-content', border: `1px solid ${emp.status === 1 ? '#d1fae5' : '#fee2e2'}`
                      }}>
                        {emp.status === 1 ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      {emp.status === 0 && (
                        <p style={{ fontSize: '11.5px', color: '#94a3b8' }}>Exited: {new Date(emp.exit_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => setSelectedEmployee(emp)} 
                      style={{ background: '#f8fafc', color: '#64748b' }}
                      className="action-btn" 
                      title="View Profile Details"
                    >
                      <HiOutlineEye size={17} />
                    </button>
                    
                    {activeTab === 'ACTIVE' && (
                      <>
                        <Link to={`/edit-employee/${emp.id}`} className="action-btn" title="Edit Employee">
                          <HiOutlinePencilAlt size={17} />
                        </Link>
                        <button onClick={() => setExitTarget(emp)} className="action-btn-danger" title="Mark as Inactive">
                          <HiOutlineLogout size={17} />
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'HISTORY' && emp.status === 0 && (
                       <button onClick={() => handleRestore(emp.id)} className="action-btn-success" title="Restore to Active">
                         <HiOutlineRefresh size={17} />
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Showing <b>{employees.length}</b> of <b>{total}</b> members</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary" style={{ padding: '7px 14px', borderRadius: '10px' }}>
                <HiOutlineChevronLeft size={16} /> Previous
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary" style={{ padding: '7px 14px', borderRadius: '10px' }}>
                Next <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {exitTarget && (
        <MarkExitedModal 
          employee={exitTarget} 
          onConfirm={handleMarkAsExited} 
          onCancel={() => setExitTarget(null)} 
        />
      )}

      {selectedEmployee && (
        <EmployeeDetailsModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
        />
      )}

      <style>{`
        .action-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: #eff6ff; color: #2563eb;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover { background: #2563eb; color: #fff; transform: translateY(-1px); }
        
        .action-btn-danger {
          width: 36px; height: 36px; border-radius: 10px;
          background: #fff1f2; color: #e11d48;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .action-btn-danger:hover { background: #e11d48; color: #fff; transform: translateY(-1px); }

        .action-btn-success {
          width: 36px; height: 36px; border-radius: 10px;
          background: #f0fdf4; color: #16a34a;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .action-btn-success:hover { background: #16a34a; color: #fff; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}