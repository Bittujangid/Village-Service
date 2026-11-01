import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  LogOut,
  Filter,
  RefreshCw,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Search,
  MessageSquare,
  Languages,
  Activity,
  BarChart3,
  Flame,
  Building,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { getStats, getComplaints, updateStatus, getWardInsights } from '../api/admin';
import { getNotices, createNotice, deleteNotice } from '../api/notices';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import WardHeatmap from '../components/admin/WardHeatmap';
import WardCharts from '../components/admin/WardCharts';
import ExportReportButton from '../components/admin/ExportReportButton';

const INITIAL_STATS = {
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
};

const NOTICE_CATEGORIES = [
  'सामान्य सूचना',
  'पेयजल व जल आपूर्ति',
  'स्वच्छता अभियान',
  'विद्युत आपूर्ति',
  'सड़क व निर्माण',
  'कृषि व योजनाएं',
];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  // Active Tab: 'complaints' or 'notices'
  const [activeTab, setActiveTab] = useState('complaints');

  // Stats state
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loadingStats, setLoadingStats] = useState(false);

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const selectedWard = wardFilter;
  const setSelectedWard = setWardFilter;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);

  // Status edit inline state map { [complaintId]: { status, adminRemarks, saving: boolean } }
  const [editState, setEditState] = useState({});

  // Notices state
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    category: NOTICE_CATEGORIES[0],
    isImportant: false,
  });
  const [creatingNotice, setCreatingNotice] = useState(false);

  // Ward Analytics & Heatmap state
  const [analyticsData, setAnalyticsData] = useState({
    wardBreakdown: [],
    categoryDistribution: [],
    resolutionMetrics: {},
    criticalWard: 1,
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Logout handler
  const handleLogout = () => {
    logout();
    toast.success('आप सफलतापूर्वक लॉगआउट हो गए हैं');
    navigate('/admin/login');
  };

  // Helper to dynamically calculate stats from full complaints list with case-insensitive matching
  const calculateStatsFromComplaints = (items) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const totalComplaints = items.length;
    const pendingCount = items.filter(
      (c) => c.status?.toLowerCase() === 'pending' || c.status === 'लंबित'
    ).length;
    const inProgressCount = items.filter(
      (c) =>
        ['in-progress', 'in_progress', 'in progress'].includes(c.status?.toLowerCase()) ||
        c.status === 'प्रगति पर'
    ).length;
    const resolvedCount = items.filter(
      (c) =>
        c.status?.toLowerCase() === 'resolved' ||
        c.status === 'समाधान पूर्ण' ||
        c.status === 'निस्तारित'
    ).length;

    return {
      total: totalComplaints,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    };
  };

  // 1. Fetch Stats
  const fetchDashboardStats = async (fallbackList = null) => {
    try {
      setLoadingStats(true);
      const data = await getStats();
      const statsData = data?.data || data?.stats || data;
      if (
        statsData &&
        (statsData.total !== undefined || statsData.totalComplaints !== undefined)
      ) {
        setStats({
          total: Number(statsData.total ?? statsData.totalComplaints ?? 0),
          pending: Number(statsData.pending ?? 0),
          inProgress: Number(statsData.inProgress ?? statsData.in_progress ?? 0),
          resolved: Number(statsData.resolved ?? 0),
        });
        return;
      }
    } catch (err) {
      console.warn('Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }

    // Dynamic Fallback: calculate from full complaints list if backend stats returned 0 or failed
    const listToCompute = fallbackList || complaints;
    if (listToCompute && listToCompute.length > 0) {
      const derived = calculateStatsFromComplaints(listToCompute);
      if (derived) {
        setStats(derived);
      }
    }
  };

  // 2. Fetch Complaints (supports explicit overrides for immediate reactivity)
  const fetchComplaintsList = async (
    pageNumber = 1,
    wardOverride = null,
    statusOverride = null
  ) => {
    try {
      setLoadingComplaints(true);
      const params = {
        page: pageNumber,
        limit: 10,
      };

      const activeWard = wardOverride !== null ? wardOverride : selectedWard;
      const activeStatus = statusOverride !== null ? statusOverride : statusFilter;

      if (activeStatus) params.status = activeStatus;
      if (activeWard) params.wardNumber = activeWard;

      const data = await getComplaints(params);

      const items = Array.isArray(data)
        ? data
        : data?.complaints || data?.data || [];

      if (items.length > 0) {
        setComplaints(items);
        setTotalPages(data?.totalPages || data?.pages || 1);
        setTotalComplaints(data?.total || data?.pagination?.total || items.length);

        // If global stats haven't been loaded yet or are 0, dynamically derive if no filters active
        if (!activeStatus && !activeWard) {
          setStats((prev) => {
            if (prev.total === 0) {
              const derived = calculateStatsFromComplaints(items);
              return derived || prev;
            }
            return prev;
          });
        }
      } else {
        setComplaints([]);
        setTotalPages(1);
        setTotalComplaints(0);
      }
    } catch (err) {
      console.warn('Complaints fetch error:', err);
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // 3. Fetch Notices
  const fetchNoticesList = async () => {
    try {
      setLoadingNotices(true);
      const data = await getNotices();
      const list = Array.isArray(data)
        ? data
        : data?.notices || data?.data || [];
      setNotices(list);
    } catch (err) {
      console.warn('Notices fetch error:', err);
      setNotices([]);
    } finally {
      setLoadingNotices(false);
    }
  };

  // Fetch Ward-Wise Analytics & Heatmap data
  const fetchWardAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await getWardInsights();
      if (res?.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.warn('Ward analytics fetch error:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Mount: fetch stats, notices, and analytics
  useEffect(() => {
    fetchDashboardStats();
    fetchNoticesList();
    fetchWardAnalyticsData();
  }, []);

  // Reactive complaints fetching on selectedWard, statusFilter, page, or activeTab change
  useEffect(() => {
    if (activeTab === 'complaints' || activeTab === 'grievances') {
      fetchComplaintsList(page, selectedWard, statusFilter);
    }
  }, [selectedWard, statusFilter, page, activeTab]);

  // When clicking a ward card in heatmap, filter complaints by that ward & switch tab immediately
  const handleSelectWardFromHeatmap = (wardNumber) => {
    const wardStr = String(wardNumber);
    setSelectedWard(wardStr);
    setPage(1);
    setActiveTab('complaints');
    // Immediately trigger fetch with explicit ward number so table updates without delay
    fetchComplaintsList(1, wardStr, statusFilter);
    toast.success(
      lang === 'hi'
        ? `वार्ड ${wardNumber} की शिकायतें फ़िल्टर की गईं`
        : `Filtered complaints for Ward ${wardNumber}`
    );
  };

  // Update Status
  const handleStatusChange = (id, newStatus) => {
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: newStatus,
      },
    }));
  };

  const handleRemarksChange = (id, newRemarks) => {
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        adminRemarks: newRemarks,
      },
    }));
  };

  const handleSaveStatus = async (complaintItem) => {
    const id = complaintItem._id || complaintItem.id;
    const currentEdit = editState[id] || {};
    const statusToSave = currentEdit.status || complaintItem.status || 'Pending';
    const remarksToSave =
      currentEdit.adminRemarks !== undefined
        ? currentEdit.adminRemarks
        : complaintItem.adminRemarks || '';

    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], saving: true },
    }));

    try {
      await updateStatus(id, {
        status: statusToSave,
        adminRemarks: remarksToSave,
      });

      toast.success('स्थिति सफलतापूर्वक अपडेट की गई!');

      // Immediately update local complaints state
      const updatedComplaints = complaints.map((c) =>
        (c._id || c.id) === id
          ? { ...c, status: statusToSave, adminRemarks: remarksToSave }
          : c
      );
      setComplaints(updatedComplaints);

      // Clear edit state for this item
      setEditState((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      // Immediately re-fetch summary counters and analytics from backend
      await fetchDashboardStats(updatedComplaints);
      fetchWardAnalyticsData();
    } catch (err) {
      console.warn('Update status error:', err);
      toast.error(err?.response?.data?.message || 'स्थिति अपडेट करने में समस्या आई');
    } finally {
      setEditState((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), saving: false },
      }));
    }
  };

  // Create Notice
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.description.trim()) {
      toast.error('कृपया सूचना का शीर्षक और विवरण दोनों भरें');
      return;
    }

    setCreatingNotice(true);
    try {
      await createNotice(newNotice);
      toast.success('नई सार्वजनिक सूचना सफलतापूर्वक प्रकाशित की गई!');
      setNewNotice({
        title: '',
        description: '',
        category: NOTICE_CATEGORIES[0],
        isImportant: false,
      });
      await fetchNoticesList();
    } catch (err) {
      console.warn('Create notice error:', err);
      const msg = err?.response?.data?.message || 'सूचना प्रकाशित करने में समस्या आई';
      toast.error(msg);
    } finally {
      setCreatingNotice(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id) => {
    if (!window.confirm('क्या आप वाकई इस सूचना को हटाना चाहते हैं?')) {
      return;
    }

    try {
      await deleteNotice(id);
      toast.success('सूचना सफलतापूर्वक हटा दी गई');
      setNotices((prev) => prev.filter((n) => (n._id || n.id) !== id));
      await fetchNoticesList();
    } catch (err) {
      console.warn('Delete notice error:', err);
      const msg = err?.response?.data?.message || 'सूचना हटाने में समस्या आई';
      toast.error(msg);
    }
  };

  // Filter Apply
  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchComplaintsList(1, selectedWard, statusFilter);
  };

  const handleResetFilter = () => {
    setStatusFilter('');
    setSelectedWard('');
    setPage(1);
    fetchComplaintsList(1, '', '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'उपलब्ध नहीं';
    try {
      return new Date(dateString).toLocaleDateString('hi-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-5">
          {/* Left: Brand & Admin Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 border border-blue-200 shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight truncate">
                  ग्राम पंचायत सहरी
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 shrink-0">
                  (Admin)
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate hidden xs:block">
                शिकायत निवारण एवं नागरिक सूचना नियंत्रण कक्ष
              </p>
            </div>
          </div>

          {/* Right: Language, Refresh & Logout */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={toggleLang}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-blue-900 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors touch-target-min"
              title={lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
              aria-label="Toggle Language"
            >
              <Languages className="w-4 h-4 text-blue-900 shrink-0" />
              <span className="md:hidden">{lang === 'hi' ? 'EN' : 'हि'}</span>
              <span className="hidden md:inline">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchDashboardStats();
                fetchComplaintsList(page);
                fetchNoticesList();
                fetchWardAnalyticsData();
                toast.success(lang === 'hi' ? 'डेटा रीफ्रेश किया गया' : 'Data refreshed');
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors touch-target-min"
              title={lang === 'hi' ? 'रीफ्रेश करें' : 'Refresh'}
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'रीफ्रेश' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors touch-target-min"
              aria-label={lang === 'hi' ? 'लॉगआउट' : 'Logout'}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs w-full">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 w-full">
            <button
              type="button"
              onClick={() => setActiveTab('complaints')}
              className={`shrink-0 flex-1 min-w-fit px-3 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center justify-center gap-2 touch-target-min cursor-pointer ${(activeTab === 'complaints' || activeTab === 'grievances')
                  ? 'bg-blue-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.grievanceManagementTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`shrink-0 flex-1 min-w-fit px-3 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center justify-center gap-2 touch-target-min cursor-pointer ${activeTab === 'analytics'
                  ? 'bg-blue-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>{t.wardAnalyticsTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notices')}
              className={`shrink-0 flex-1 min-w-fit px-3 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center justify-center gap-2 touch-target-min cursor-pointer ${activeTab === 'notices'
                  ? 'bg-blue-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>{lang === 'hi' ? 'सार्वजनिक सूचनाएं (Notices)' : 'Public Notices'}</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: COMPLAINTS / GRIEVANCES ================= */}
        {(activeTab === 'complaints' || activeTab === 'grievances') && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total */}
              <div className="min-w-0 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase font-bold text-slate-500 tracking-wider truncate">
                    कुल शिकायतें (Total)
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              {/* Card 2: Pending (Amber) */}
              <div className="min-w-0 bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase font-bold text-amber-800 tracking-wider truncate">
                    लंबित (Pending)
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              {/* Card 3: In Progress (Blue) */}
              <div className="min-w-0 bg-blue-50/70 p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase font-bold text-blue-800 tracking-wider truncate">
                    प्रगति पर (In Progress)
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              {/* Card 4: Resolved (Green) */}
              <div className="min-w-0 bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase font-bold text-emerald-800 tracking-wider truncate">
                    समाधान पूर्ण (Resolved)
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                    {stats.resolved}
                  </p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <form onSubmit={handleApplyFilter} className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4">
                {/* Status Dropdown */}
                <div className="flex-1">
                  <label htmlFor="filter-status" className="block text-xs font-bold text-slate-700 mb-1">
                    स्थिति फ़िल्टर (Status)
                  </label>
                  <select
                    id="filter-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">सभी स्थितियां (All Status)</option>
                    <option value="Pending">लंबित (Pending)</option>
                    <option value="In Progress">प्रगति पर (In Progress)</option>
                    <option value="Resolved">समाधान पूर्ण (Resolved)</option>
                  </select>
                </div>

                {/* Ward Number Input */}
                <div className="flex-1">
                  <label htmlFor="filter-ward" className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'वार्ड संख्या (वार्ड 1-7)' : 'Ward Number (Ward 1-7)'}
                  </label>
                  <input
                    id="filter-ward"
                    type="number"
                    min="1"
                    max="7"
                    value={wardFilter}
                    onChange={(e) => setWardFilter(e.target.value)}
                    placeholder={lang === 'hi' ? 'वार्ड 1-7 (उदा. 4)' : 'Ward 1-7 (e.g. 4)'}
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 md:flex-none min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-target-min transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span>लागू करें (Apply)</span>
                  </button>

                  {(statusFilter || wardFilter) && (
                    <button
                      type="button"
                      onClick={handleResetFilter}
                      className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-colors touch-target-min"
                    >
                      रीसेट
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Complaints Table Container (horizontally scrollable on mobile) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  शिकायत निवारण सूची
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  कुल परिणाम: {totalComplaints}
                </span>
              </div>

              {loadingComplaints ? (
                <LoadingSpinner label="शिकायतें लोड हो रही हैं..." />
              ) : complaints.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-base font-bold">कोई शिकायत उपलब्ध नहीं है</p>
                  <p className="text-xs text-slate-400 mt-1">
                    वर्तमान फ़िल्टर के अनुसार कोई रिकॉर्ड नहीं मिला।
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Tracking ID</th>
                        <th className="py-3.5 px-4">नागरिक नाम</th>
                        <th className="py-3.5 px-4">फोन (Call)</th>
                        <th className="py-3.5 px-4">वार्ड</th>
                        <th className="py-3.5 px-4">श्रेणी</th>
                        <th className="py-3.5 px-4">फोटो</th>
                        <th className="py-3.5 px-4">दिनांक</th>
                        <th className="py-3.5 px-4">स्थिति</th>
                        <th className="py-3.5 px-4 min-w-[280px]">कार्रवाई एवं टिप्पणी (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {complaints.map((item) => {
                        const id = item._id || item.id;
                        const itemEdit = editState[id] || {};
                        const selectedStatus = itemEdit.status !== undefined ? itemEdit.status : item.status;
                        const currentRemarks = itemEdit.adminRemarks !== undefined ? itemEdit.adminRemarks : (item.adminRemarks || '');
                        const isSaving = itemEdit.saving;

                        return (
                          <tr key={id} className="hover:bg-slate-50/60 transition-colors">
                            {/* Tracking ID */}
                            <td className="py-4 px-4 font-mono font-bold text-emerald-800">
                              #{item.trackingId || id}
                            </td>

                            {/* Citizen Name */}
                            <td className="py-4 px-4 font-semibold text-slate-900">
                              {item.citizenName || item.name || 'गोपनीय'}
                            </td>

                            {/* Phone with Call Link */}
                            <td className="py-4 px-4">
                              <a
                                href={`tel:${item.phone}`}
                                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-mono font-medium underline"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{item.phone}</span>
                              </a>
                            </td>

                            {/* Ward */}
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                                वार्ड {item.wardNumber ?? item.ward ?? 'अस्पष्ट'}
                              </span>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                              {item.category}
                            </td>

                            {/* Image Thumbnail (40x40) */}
                            <td className="py-4 px-4">
                              {item.imageUrl || item.image ? (
                                <a
                                  href={item.imageUrl || item.image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block group relative"
                                  title="पूरी फोटो नए टैब में खोलें"
                                >
                                  <img
                                    src={item.imageUrl || item.image}
                                    alt="शिकायत फोटो"
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 group-hover:scale-110 transition-transform shadow-xs"
                                  />
                                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </span>
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400">उपलब्ध नहीं</span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {formatDate(item.createdAt)}
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-4">
                              <StatusBadge status={item.status} />
                            </td>

                            {/* Inline Actions */}
                            <td className="py-4 px-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={selectedStatus}
                                    onChange={(e) => handleStatusChange(id, e.target.value)}
                                    className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                                  >
                                    <option value="Pending">लंबित (Pending)</option>
                                    <option value="In Progress">प्रगति पर (In Progress)</option>
                                    <option value="Resolved">समाधान पूर्ण (Resolved)</option>
                                  </select>

                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleSaveStatus(item)}
                                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-xs shadow-xs transition-colors focus:outline-none"
                                  >
                                    {isSaving ? '...' : 'सेव करें'}
                                  </button>
                                </div>

                                <textarea
                                  rows={1}
                                  value={currentRemarks}
                                  onChange={(e) => handleRemarksChange(id, e.target.value)}
                                  placeholder="प्रशासनिक टिप्पणी लिखें..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  पृष्ठ {page} / {totalPages || 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loadingComplaints}
                    onClick={() => {
                      const newP = Math.max(1, page - 1);
                      setPage(newP);
                      fetchComplaintsList(newP);
                    }}
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors touch-target-min"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>पिछला (Prev)</span>
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages || loadingComplaints}
                    onClick={() => {
                      const newP = page + 1;
                      setPage(newP);
                      fetchComplaintsList(newP);
                    }}
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors touch-target-min"
                  >
                    <span>अगला (Next)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: WARD ANALYTICS & HEATMAP ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header / Sub-nav bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 mb-1">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900 shrink-0" />
                    <span>{t.analyticsHeading}</span>
                  </h2>
                  <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 shrink-0">
                    Wards 1–7
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.analyticsSubtitle}
                </p>
              </div>

              {/* Action Buttons: Download PDF Report & Refresh */}
              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end">
                <ExportReportButton
                  analyticsData={analyticsData}
                  stats={stats}
                />
                <button
                  type="button"
                  onClick={() => {
                    fetchWardAnalyticsData();
                    toast.success(lang === 'hi' ? 'एनालिटिक्स रीफ्रेश किया गया' : 'Analytics refreshed');
                  }}
                  disabled={loadingAnalytics}
                  className="min-h-[40px] px-3 sm:px-3.5 py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors touch-target-min shrink-0"
                  title={lang === 'hi' ? 'एनालिटिक्स रीफ्रेश करें' : 'Refresh Analytics'}
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{lang === 'hi' ? 'रीफ्रेश' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Top 5 KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Card 1: Total Wards */}
              <div className="min-w-0 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{t.kpiTotalWards}</span>
                  <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">7</div>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{lang === 'hi' ? 'वार्ड 1 से 7 सक्रिय' : 'Wards 1 to 7 active'}</span>
              </div>

              {/* Card 2: Total Complaints */}
              <div className="min-w-0 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{lang === 'hi' ? 'कुल शिकायतें' : 'Total Grievances'}</span>
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {analyticsData.resolutionMetrics?.totalAllComplaints || stats.total || 0}
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{lang === 'hi' ? 'सभी 7 वार्डों से' : 'Across all 7 wards'}</span>
              </div>

              {/* Card 3: Overall Resolution Rate */}
              <div className="min-w-0 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 truncate">{t.kpiOverallRate}</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700">
                  {analyticsData.resolutionMetrics?.overallResolutionRate ?? 0}%
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                  {analyticsData.resolutionMetrics?.totalResolvedAll || stats.resolved || 0} {lang === 'hi' ? 'निस्तारित' : 'resolved'}
                </span>
              </div>

              {/* Card 4: Critical Ward */}
              <div className="min-w-0 bg-rose-50/70 p-3.5 sm:p-4 rounded-2xl border border-rose-200 shadow-xs">
                <div className="flex items-center justify-between text-rose-500 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 truncate">{t.kpiCriticalWard}</span>
                  <Flame className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-700">
                  {lang === 'hi' ? `वार्ड ${analyticsData.criticalWard || 1}` : `Ward ${analyticsData.criticalWard || 1}`}
                </div>
                <span className="text-[11px] text-rose-600 font-semibold block mt-0.5 truncate">{lang === 'hi' ? 'अधिकतम लंबित मामले' : 'Highest open volume'}</span>
              </div>

              {/* Card 5: Average Resolution Time */}
              <div className="min-w-0 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{t.kpiAvgDays}</span>
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {analyticsData.resolutionMetrics?.averageResolutionDays || 2.4} <span className="text-xs font-normal text-slate-500">{t.kpiDaysUnit}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{lang === 'hi' ? 'औसत निस्तारण अवधि' : 'Average time to resolve'}</span>
              </div>
            </div>

            {/* Ward Severity Heatmap */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <WardHeatmap
                wardBreakdown={analyticsData.wardBreakdown}
                criticalWard={analyticsData.criticalWard}
                selectedWard={wardFilter}
                onSelectWard={handleSelectWardFromHeatmap}
              />
            </div>

            {/* Ward Visual Charts (Clustered Bar + Category Donut) */}
            <WardCharts
              wardBreakdown={analyticsData.wardBreakdown}
              categoryDistribution={analyticsData.categoryDistribution}
            />
          </div>
        )}

        {/* ================= TAB 3: NOTICES ================= */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left: Create Notice Form */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-700" />
                <span>नई सार्वजनिक सूचना बनाएं</span>
              </h3>

              <form onSubmit={handleCreateNotice} className="space-y-4">
                <div>
                  <label htmlFor="notice-cat" className="block text-xs font-bold text-slate-700 mb-1">
                    श्रेणी चुनें (Category)
                  </label>
                  <select
                    id="notice-cat"
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {NOTICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notice-title" className="block text-xs font-bold text-slate-700 mb-1">
                    सूचना शीर्षक (Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="notice-title"
                    type="text"
                    required
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    placeholder="उदा. ग्राम सभा की विशेष बैठक"
                    className="w-full min-h-[48px] px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="notice-desc" className="block text-xs font-bold text-slate-700 mb-1">
                    सूचना विवरण (Description) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="notice-desc"
                    rows={4}
                    required
                    value={newNotice.description}
                    onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                    placeholder="सूचना का पूरा विवरण लिखें जो नागरिकों को प्रदर्शित होगा..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="notice-important"
                    type="checkbox"
                    checked={newNotice.isImportant}
                    onChange={(e) => setNewNotice({ ...newNotice, isImportant: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="notice-important" className="text-xs font-bold text-slate-700 cursor-pointer">
                    ⚠️ अति महत्वपूर्ण सूचना (Mark as High Priority / Important)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={creatingNotice}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 touch-target-min"
                >
                  {creatingNotice ? (
                    <span>प्रकाशित कर रहे हैं...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>प्रकाशित करें (Publish Notice)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Existing Notices List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  वर्तमान सक्रिय सूचनाएं (Active Notices)
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  कुल: {notices.length}
                </span>
              </div>

              {loadingNotices ? (
                <LoadingSpinner label="सूचनाएं लोड हो रही हैं..." />
              ) : notices.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold">कोई सूचना प्रकाशित नहीं है</p>
                  <p className="text-xs text-slate-400 mt-1">
                    बाईं ओर दिए गए फॉर्म से नई सूचना जोड़ें।
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((n) => {
                    const noticeId = n._id || n.id;
                    return (
                      <div
                        key={noticeId}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {n.isImportant && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                                ⚠️ अति महत्वपूर्ण
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {n.category || 'सूचना'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDate(n.createdAt)}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900">
                            {n.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {n.description || n.content}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(noticeId)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors touch-target-min"
                          title="सूचना हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>हटाएं (Delete)</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
