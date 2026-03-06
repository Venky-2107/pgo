import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [owners, setOwners] = useState([]);
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({ totalOwners: 0, totalProperties: 0, totalTenants: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('owners');

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [ownersRes, propsRes, statsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/owners', { headers }),
                fetch('http://localhost:5000/api/admin/properties', { headers }),
                fetch('http://localhost:5000/api/admin/stats', { headers })
            ]);

            if (ownersRes.ok) {
                const data = await ownersRes.json();
                setOwners(data.owners);
            }
            if (propsRes.ok) {
                const data = await propsRes.json();
                setProperties(data.properties);
            }
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type, id, action) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/${type}/${id}/${action}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchData();
        } catch (err) {
            console.error('Action error:', err);
        }
    };

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
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.05)_0%,transparent_50%)]"></div>

            <div className="container-premium max-w-6xl px-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                            SuperAdmin <span className="text-gradient">Control</span>
                        </h1>
                        <p className="text-text-muted text-lg">System-wide surveillance and infrastructure orchestration.</p>
                    </div>
                    <button onClick={handleLogout} className="btn-premium bg-error/10 text-error hover:bg-error/20 px-6 py-3 rounded-2xl border border-error/20 uppercase font-black text-[10px] tracking-[0.2em]">
                        Terminate Session
                    </button>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 animate-fade">
                    <div className="glass-card p-6 border-primary/10 bg-primary/2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Authenticated Owners</p>
                        <h4 className="text-4xl font-black text-primary">{stats.totalOwners}</h4>
                    </div>
                    <div className="glass-card p-6 border-secondary/10 bg-secondary/2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Deployed Nodes</p>
                        <h4 className="text-4xl font-black text-secondary">{stats.totalProperties}</h4>
                    </div>
                    <div className="glass-card p-6 border-accent/10 bg-accent/2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Active Citizens</p>
                        <h4 className="text-4xl font-black text-accent">{stats.totalTenants}</h4>
                    </div>
                </div>

                {/* Tabs */}
                <div className="glass p-1.5 rounded-3xl border-white/5 mb-10 flex gap-1 w-full max-w-md mx-auto md:mx-0 animate-fade">
                    <button
                        onClick={() => setActiveTab('owners')}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'owners' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-white'}`}
                    >
                        Owner Registry
                    </button>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-white'}`}
                    >
                        Property Assets
                    </button>
                </div>

                <div className="animate-fade" style={{ animationDelay: '0.1s' }}>
                    {activeTab === 'owners' ? (
                        <div className="space-y-4">
                            {owners.length === 0 ? (
                                <div className="glass p-12 rounded-[2.5rem] text-center border-dashed border-white/5 uppercase font-black text-text-muted text-sm tracking-widest">No Owners Registered</div>
                            ) : (
                                owners.map(o => (
                                    <div key={o.id} className="glass-card p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white/[0.03] transition-all">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="w-16 h-16 rounded-[2rem] bg-surface flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all">
                                                👤
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black mb-1">{o.name}</h4>
                                                <p className="text-xs text-text-muted font-bold tracking-tight">{o.email} • {o.contact}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">{o.property_count} Props</span>
                                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">{o.tenant_count} Tenants</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                                            <div className="hidden md:block text-right mr-4">
                                                <p className="text-[10px] uppercase font-black text-text-muted mb-1">Clearance</p>
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${o.is_approved ? 'text-success' : 'text-warning'}`}>
                                                    {o.is_approved ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>
                                            {o.is_approved ? (
                                                <button onClick={() => handleAction('owners', o.id, 'reject')} className="btn-premium glass text-xs font-black uppercase text-error hover:bg-error/10 border-error/20 flex-1 md:flex-none">Revoke Access</button>
                                            ) : (
                                                <button onClick={() => handleAction('owners', o.id, 'approve')} className="btn-premium btn-primary text-xs font-black uppercase flex-1 md:flex-none">Approve Credentials</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {properties.length === 0 ? (
                                <div className="glass p-12 rounded-[2.5rem] text-center border-dashed border-white/5 uppercase font-black text-text-muted text-sm tracking-widest">No Assets Deployed</div>
                            ) : (
                                properties.map(p => (
                                    <div key={p.id} className="glass-card p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white/[0.03] transition-all">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="w-16 h-16 rounded-[2rem] bg-surface flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-all">
                                                🏠
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black mb-1">{p.property_name}</h4>
                                                <p className="text-xs text-text-muted font-bold tracking-tight uppercase tracking-widest">{p.property_type} • {p.city}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className="text-[10px] text-accent font-black uppercase tracking-tighter italic">Owned by {p.owner_name || 'System'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                                            <div className="hidden md:block text-right mr-4">
                                                <p className="text-[10px] uppercase font-black text-text-muted mb-1">Network Status</p>
                                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.is_approved ? 'text-success' : 'text-warning'}`}>
                                                    {p.is_approved ? 'Active' : 'Staging'}
                                                </span>
                                            </div>
                                            {p.is_approved ? (
                                                <button onClick={() => handleAction('properties', p.id, 'reject')} className="btn-premium glass text-xs font-black uppercase text-error hover:bg-error/10 border-error/20 flex-1 md:flex-none">Deactivate Node</button>
                                            ) : (
                                                <button onClick={() => handleAction('properties', p.id, 'approve')} className="btn-premium btn-primary text-xs font-black uppercase flex-1 md:flex-none">Verify Deployment</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
