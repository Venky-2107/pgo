import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const OwnerDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProperties: 0,
        approvedProperties: 0,
        totalTenants: 0,
        activeTenants: 0
    });
    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch each independently so one failure doesn't block others
                const [statsRes, propsRes, tenantsRes] = await Promise.allSettled([
                    fetch('http://localhost:5000/api/owner/stats', { headers }),
                    fetch('http://localhost:5000/api/owner/properties', { headers }),
                    fetch('http://localhost:5000/api/owner/tenants', { headers })
                ]);

                if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                    setStats(await statsRes.value.json());
                }
                if (propsRes.status === 'fulfilled' && propsRes.value.ok) {
                    const data = await propsRes.value.json();
                    setProperties(data.properties);
                }
                if (tenantsRes.status === 'fulfilled' && tenantsRes.value.ok) {
                    const data = await tenantsRes.value.json();
                    setTenants(data.tenants.slice(0, 5));
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load dashboard data. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const StatCard = ({ title, value, icon, color }) => (
        <div className="glass-card p-6 flex items-center gap-5 group hover:scale-[1.02] transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-${color}/10 text-${color} group-hover:bg-${color}/20 transition-colors shadow-inner`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{title}</p>
                <h4 className="text-3xl font-black">{value}</h4>
            </div>
        </div>
    );

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20 pt-24 px-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.05)_0%,transparent_50%)]"></div>

            <div className="container-premium max-w-6xl px-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                            Owner <span className="text-gradient">Console</span>
                        </h1>
                        <p className="text-text-muted text-lg">Welcome back, <span className="text-white font-bold">{user?.name}</span>. Your infrastructure is performing well.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-8 md:mt-0">
                        <Link to="/owner/add-property" className="btn-premium btn-primary px-8 py-4 text-sm no-underline shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            + List Property
                        </Link>
                        <Link to="/owner/register-tenant" className="glass px-8 py-4 rounded-2xl text-sm font-bold border-white/5 hover:bg-white/10 transition-all no-underline shadow-xl">
                            + Onboard Tenant
                        </Link>
                        <Link to="/owner/manage-inventory" className="glass px-8 py-4 rounded-2xl text-sm font-bold border-accent/20 text-accent hover:bg-accent/5 transition-all no-underline shadow-xl">
                            ⚙️ Manage Inventory
                        </Link>
                        <button onClick={handleLogout} className="btn-premium bg-error/10 text-error hover:bg-error/20 px-5 py-3 rounded-2xl border border-error/20 uppercase font-black text-[10px] tracking-widest">
                            Exit Console
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error p-5 rounded-2xl mb-8 flex items-center gap-3 animate-fade">
                        <span className="text-xl">⚠️</span>
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                )}

                {!user?.is_approved && (
                    <div className="glass p-6 rounded-[2rem] border-primary/30 mb-10 flex items-center justify-between gap-6 animate-fade bg-primary/5">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl animate-pulse">⏳</span>
                            <div>
                                <h4 className="font-black text-primary uppercase tracking-widest text-sm mb-1">Activation Pending</h4>
                                <p className="text-xs text-text-muted">Your account is under super-admin review. Full platform capability will be unlocked shortly.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade">
                    <StatCard title="Total Inventory" value={stats.totalProperties} icon="🏢" color="primary" />
                    <StatCard title="Live Sites" value={stats.approvedProperties} icon="✅" color="success" />
                    <StatCard title="Total Residents" value={stats.totalTenants} icon="👥" color="secondary" />
                    <StatCard title="Occupied Beds" value={stats.activeTenants} icon="🛏️" color="accent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade" style={{ animationDelay: '0.2s' }}>
                    {/* My Properties List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black uppercase tracking-widest">Active Inventory</h3>
                        </div>

                        <div className="space-y-4">
                            {properties.length === 0 ? (
                                <div className="glass p-12 rounded-[2.5rem] text-center border-dashed border-white/5 bg-white/[0.01]">
                                    <p className="text-text-muted uppercase tracking-widest font-black text-sm">No Properties Listed Yet</p>
                                </div>
                            ) : (
                                properties.map(p => {
                                    const totalBeds = parseInt(p.total_beds) || 0;
                                    const occupiedBeds = parseInt(p.occupied_beds) || 0;
                                    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

                                    return (
                                        <div key={p.id} className="glass-card p-5 flex flex-col items-stretch gap-6 hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="flex items-center gap-5 w-full md:w-auto">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                                        🏠
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black mb-1">{p.property_name}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-text-muted">
                                                            <span className="bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-tighter font-bold">{p.property_type}</span>
                                                            <span>•</span>
                                                            <span>{p.city}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 w-full md:w-auto gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8">
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Beds</p>
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span className="text-sm font-black">{occupiedBeds}</span>
                                                            <span className="text-[9px] text-text-muted">/</span>
                                                            <span className="text-sm font-black text-white/40">{totalBeds}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Occupancy</p>
                                                        <p className="text-sm font-black text-accent">{occupancyRate}%</p>
                                                    </div>
                                                    <div className="text-center flex flex-col items-center">
                                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Status</p>
                                                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${p.is_approved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                            {p.is_approved ? 'Active' : 'Deploying'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Inventory Health Bar */}
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${occupancyRate}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Recent Tenants */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black uppercase tracking-widest">New Residents</h3>
                        </div>

                        <div className="glass-card divide-y divide-white/5 overflow-hidden">
                            {tenants.length === 0 ? (
                                <div className="p-10 text-center text-text-muted uppercase tracking-widest font-black text-xs opacity-50">Empty Queue</div>
                            ) : (
                                tenants.map(t => (
                                    <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors group">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg shadow-inner group-hover:rotate-6 transition-transform">
                                            👤
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black truncate">{t.name}</p>
                                            <p className="text-[10px] text-text-muted uppercase tracking-tighter">Room {t.room_number || 'TBD'} • {t.property_name}</p>
                                        </div>
                                        <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="glass p-6 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group hover:scale-[1.02] transition-all">
                            <div className="relative z-10">
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Growth Center</h4>
                                <p className="text-xs text-text-muted leading-relaxed mb-4">Leverage our predictive analytics to optimize your room pricing and occupancy rates.</p>
                                <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                    Analyze Portfolio →
                                </button>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/20 blur-2xl group-hover:scale-150 transition-transform"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
