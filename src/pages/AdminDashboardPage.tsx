import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShieldCheck,
  Coins,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  Settings,
  MapPin,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Save,
  Lock,
  ShieldAlert,
} from 'lucide-react';

const defaultAdminLocations = [
  {
    id: 'state-ncr',
    name: 'National Capital Region (NCR)',
    code: 'NCR',
    isActive: true,
    cities: [
      { id: 'city-delhi', name: 'Delhi', slug: 'delhi', isActive: true },
      { id: 'city-noida', name: 'Noida', slug: 'noida', isActive: true },
      { id: 'city-gurugram', name: 'Gurugram', slug: 'gurugram', isActive: true },
      { id: 'city-ghaziabad', name: 'Ghaziabad', slug: 'ghaziabad', isActive: true },
      { id: 'city-greater-noida', name: 'Greater Noida', slug: 'greater-noida', isActive: true },
    ],
  },
  {
    id: 'state-up',
    name: 'Uttar Pradesh',
    code: 'UP',
    isActive: true,
    cities: [
      { id: 'city-noida-up', name: 'Noida', slug: 'noida-up', isActive: true },
      { id: 'city-ghaziabad-up', name: 'Ghaziabad', slug: 'ghaziabad-up', isActive: true },
    ],
  },
  {
    id: 'state-hr',
    name: 'Haryana',
    code: 'HR',
    isActive: true,
    cities: [
      { id: 'city-gurugram-hr', name: 'Gurugram', slug: 'gurugram-hr', isActive: true },
      { id: 'city-faridabad', name: 'Faridabad', slug: 'faridabad', isActive: false },
    ],
  },
];

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>(defaultAdminLocations);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'verifications' | 'settings' | 'locations' | 'users'>('metrics');

  // Setting edit state
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, vRes, sRes, statesRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminUsers().catch(() => null),
        api.getAdminVerifications().catch(() => null),
        api.getAdminSettings().catch(() => null),
        api.getAdminLocations().catch(() => null),
      ]);

      if (mRes?.data?.data) setMetrics(mRes.data.data);
      if (uRes?.data?.data) setUsers(uRes.data.data);
      if (vRes?.data?.data) setVerifications(vRes.data.data);
      if (sRes?.data?.data) {
        setSettings(sRes.data.data);
        const map: Record<string, string> = {};
        sRes.data.data.forEach((item: any) => {
          map[item.key] = item.value;
        });
        setEditingSettings(map);
      }
      if (statesRes?.data?.data && statesRes.data.data.length > 0) {
        setStates(statesRes.data.data);
      } else {
        setStates(defaultAdminLocations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && isAdmin) {
        fetchAdminData();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAdmin, isAuthLoading]);

  const handleReviewVerification = async (id: string, status: 'VERIFIED' | 'FAILED') => {
    try {
      await api.reviewVerification(id, status);
      await fetchAdminData();
    } catch (err: any) {
      alert('Failed to update verification: ' + err.message);
    }
  };

  const handleSaveSetting = async (key: string) => {
    try {
      setSavingKey(key);
      const val = editingSettings[key];
      await api.updateAdminSetting(key, val);
      alert(`Setting ${key} updated successfully to ${val}`);
      await fetchAdminData();
    } catch (err: any) {
      alert('Failed to update setting: ' + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleLocation = async (type: string, id: string, currentActive: boolean) => {
    // Instant optimistic update
    setStates((prev) =>
      prev.map((st) => {
        if (type === 'state' && st.id === id) {
          return { ...st, isActive: !currentActive };
        }
        if (type === 'city' && st.cities) {
          return {
            ...st,
            cities: st.cities.map((ct: any) =>
              ct.id === id ? { ...ct, isActive: !currentActive } : ct
            ),
          };
        }
        return st;
      })
    );

    try {
      await api.toggleAdminLocation(type, id, !currentActive);
    } catch (err: any) {
      console.warn('Backend toggle notification warning:', err.message);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.updateUserStatus(userId, nextStatus);
      await fetchAdminData();
    } catch (err: any) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  if (isAuthLoading || (loading && isAuthenticated && isAdmin)) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-neutral-500 font-medium">Verifying administrator authorization...</p>
      </div>
    );
  }

  // Strict public lockout: Only logged-in admin users can view the admin console
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-neutral-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Restricted Area
            </span>
            <h1 className="text-2xl font-black text-black tracking-tight mt-3">
              Administrator Access Required
            </h1>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed font-medium">
              This administrative console is strictly private and restricted to authorized Vaziro operators. Please sign in with administrator credentials.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('CUSTOMER')}
            className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition"
          >
            Sign In as Administrator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Platform Operator Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
            Vaziro Governance Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Proanta Technologies Private Limited • vaziro.in
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Overview Metrics
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'verifications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> DigiLocker Verification Queue ({verifications.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" /> Dynamic Business Rules
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'locations'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" /> Location Switchboard
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" /> Platform Users ({users.length})
        </button>
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Total Users</span>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">
                {metrics?.users?.total || 0}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {metrics?.users?.customers || 0} Customers • {metrics?.users?.professionals || 0} Professionals
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">DigiLocker Verified</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                {metrics?.users?.verifiedProfessionals || 0}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">Government KYC validated</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Active Jobs</span>
              <div className="text-3xl font-extrabold text-blue-700 mt-1">
                {metrics?.marketplace?.activeJobs || 0}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {metrics?.marketplace?.completedJobs || 0} Completed Delivery
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-gray-400 text-xs font-bold uppercase">Credits Deducted</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                {metrics?.financials?.totalCreditsDeducted || 0} <span className="text-xs font-normal">cr</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Application revenue ledger</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">
                Marketplace Liquidity
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Requirements Posted:</span>
                  <span className="font-bold text-gray-900">{metrics?.marketplace?.totalRequirements || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Active Service Orders:</span>
                  <span className="font-bold text-gray-900">{metrics?.marketplace?.activeJobs || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Open Arbitration Disputes:</span>
                  <span className="font-bold text-red-600">{metrics?.marketplace?.openDisputes || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider">
                Financial Escrow & GMV
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Secured GMV:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    ₹{(metrics?.financials?.totalGmvInr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Platform Commission Rate:</span>
                  <span className="font-bold text-gray-900">6.0% (Configurable)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Nominal Credit Value:</span>
                  <span className="font-bold text-gray-900">1 Credit = ₹50 INR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">DigiLocker KYC Compliance Queue</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and audit professional identity records before displaying the "✓ Verified via DigiLocker" public badge.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-4">Professional Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">
                      {v.professional?.user?.firstName} {v.professional?.user?.lastName}
                    </td>
                    <td className="p-4 text-gray-600">
                      {v.professional?.user?.phone || v.professional?.user?.email}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        {v.provider}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold ${
                          v.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-500">{v.referenceId || 'N/A'}</td>
                    <td className="p-4 text-right space-x-2">
                      {v.status !== 'VERIFIED' ? (
                        <button
                          onClick={() => handleReviewVerification(v.id, 'VERIFIED')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                        >
                          Approve KYC
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReviewVerification(v.id, 'FAILED')}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-semibold"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DYNAMIC SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 text-base">Dynamic Business Rule Configuration</h3>
            <p className="text-xs text-gray-500 mt-1">
              Adjust fee formulas, credit valuations, and marketplace policies in real time without deploying code.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {settings.map((s) => (
              <div key={s.key} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-gray-900 block font-mono">{s.key}</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.description || 'System policy parameter'}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={editingSettings[s.key] ?? s.value}
                    onChange={(e) =>
                      setEditingSettings({ ...editingSettings, [s.key]: e.target.value })
                    }
                    className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-right"
                  />
                  <button
                    onClick={() => handleSaveSetting(s.key)}
                    disabled={savingKey === s.key}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LOCATION SWITCHBOARD */}
      {activeTab === 'locations' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-200 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Geographic Coverage Controls
                </span>
                <h3 className="font-black text-gray-900 text-xl mt-1.5">Indian Location Switchboard</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Turn entire States or individual Cities <strong>ON</strong> or <strong>OFF</strong> with a single click. 
                  Active cities are immediately live for customer quote requests and service partner matching in Delhi NCR.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 block">Primary Footprint</span>
                <span className="text-sm font-black text-black">Delhi NCR (5 Hubs)</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {states.map((st) => {
              const totalCities = st.cities?.length || 0;
              const activeCities = st.cities?.filter((c: any) => c.isActive).length || 0;

              return (
                <div
                  key={st.id}
                  className={`rounded-2xl border transition p-5 ${
                    st.isActive ? 'border-neutral-200 bg-neutral-50/50' : 'border-neutral-200 bg-neutral-100/60 opacity-80'
                  }`}
                >
                  {/* State Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        st.isActive ? 'bg-black text-white' : 'bg-neutral-300 text-neutral-600'
                      }`}>
                        {st.code || st.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-base text-gray-900 block">{st.name}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {activeCities} of {totalCities} cities active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLocation('state', st.id, st.isActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm ${
                          st.isActive
                            ? 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300'
                            : 'text-neutral-600 bg-neutral-200 hover:bg-neutral-300 border border-neutral-300'
                        }`}
                      >
                        {st.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-700" /> State Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-neutral-500" /> State Inactive
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cities Grid inside State */}
                  {st.cities && st.cities.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2.5">
                        Operational Cities / Zones
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {st.cities.map((ct: any) => (
                          <div
                            key={ct.id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition ${
                              ct.isActive && st.isActive
                                ? 'bg-white border-neutral-200 shadow-sm'
                                : 'bg-neutral-100 border-dashed border-neutral-300'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-xs text-neutral-900 block">{ct.name}</span>
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {ct.isActive && st.isActive ? 'Live for quotes' : 'Paused / Offline'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleLocation('city', ct.id, ct.isActive)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                ct.isActive
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-neutral-400 hover:bg-neutral-200'
                              }`}
                              title={ct.isActive ? 'Click to Pause' : 'Click to Activate'}
                            >
                              {ct.isActive ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-neutral-400 italic">No specific cities configured yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Platform User Directory</h3>
            <p className="text-xs text-gray-500 mt-0.5">Role management and account safety controls.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Roles</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-bold text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-4 text-gray-600">{u.phone || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{u.email || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {u.roles?.map((r: any) => (
                          <span
                            key={r.id || r.role?.name}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700"
                          >
                            {r.role?.name || r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
