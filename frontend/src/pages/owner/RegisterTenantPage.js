import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterTenantPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [properties, setProperties] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [fetchingRooms, setFetchingRooms] = useState(false);
    const [uploadType, setUploadType] = useState(null); // 'file', 'camera', 'drive'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'tenant123',
        contact: '',
        dob: '',
        property_id: '',
        room_id: '',
        join_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/owner/properties', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data.properties.filter(p => p.is_approved));
                }
            } catch (err) {
                console.error('Error fetching properties:', err);
            }
        };
        fetchProperties();
    }, [token]);

    const handlePropertyChange = async (e) => {
        const propertyId = e.target.value;
        setFormData(prev => ({ ...prev, property_id: propertyId, room_id: '' }));
        setRooms([]);

        if (propertyId) {
            setFetchingRooms(true);
            try {
                const res = await fetch(`http://localhost:5000/api/owner/properties/${propertyId}/rooms`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data.rooms.filter(r => r.occupied_beds < r.total_beds));
                }
            } catch (err) {
                console.error('Error fetching rooms:', err);
            } finally {
                setFetchingRooms(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Mobile number validation: only digits
        if (name === 'contact') {
            const sanitized = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: sanitized }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedDoc(file.name);
            setUploadType('file');
        }
    };

    const triggerCamera = () => {
        // Triggering file input with capture attribute for mobile
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Strict 10-digit validation
        if (!/^[0-9]{10}$/.test(formData.contact)) {
            setError('Please enter a valid 10-digit contact number');
            return;
        }

        if (!formData.property_id || !formData.room_id) {
            setError('Please select both a property and a room');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/owner/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/owner', { replace: true });
            } else {
                setError(data.message || 'Failed to register tenant');
            }
        } catch (err) {
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 relative bg-background">
            <div className="fixed top-0 right-0 w-full h-[600px] bg-gradient-to-b from-secondary/5 to-transparent -z-10 pointer-events-none"></div>

            <div className="container-premium max-w-2xl px-0">
                <header className="mb-12 animate-fade">
                    <Link to="/owner" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:opacity-80 transition-all no-underline">
                        <span>←</span> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight">Onboard <span className="text-gradient">Tenant</span></h1>
                    <p className="text-text-muted mt-2">Assign space and track documents for your residents.</p>
                </header>

                {(properties.length === 0 && !loading) && (
                    <div className="bg-primary/10 border border-primary/20 text-primary p-6 rounded-2xl mb-8 flex items-start gap-4 animate-fade">
                        <span className="text-2xl">🏠</span>
                        <p className="font-semibold text-sm">You need at least one <strong>approved</strong> property to start onboarding tenants.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error p-5 rounded-2xl mb-8 flex items-center gap-3 animate-fade">
                        <span className="text-xl">⚠️</span>
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                )}

                <div className="glass-card p-6 md:p-10 animate-fade shadow-2xl relative">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Personal Details */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Resident Profile</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1">Full Identity Name</label>
                                    <input type="text" name="name" className="input-premium" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={handleChange} required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-1">Email Address</label>
                                        <input type="email" name="email" className="input-premium" placeholder="rahul@example.com" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-1 flex justify-between">
                                            <span>Contact/WhatsApp</span>
                                            <span className={`${formData.contact.length === 10 ? 'text-success' : 'text-error'} tracking-normal transition-colors`}>{formData.contact.length}/10</span>
                                        </label>
                                        <input
                                            type="text" name="contact" className={`input-premium ${formData.contact.length > 0 && formData.contact.length < 10 ? 'border-error/50 focus:border-error' : ''}`}
                                            placeholder="10-digit number" value={formData.contact} onChange={handleChange} required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-1">Date of Birth</label>
                                        <input type="date" name="dob" className="input-premium appearance-none custom-calendar-icon" value={formData.dob} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-1">Join Date</label>
                                        <input type="date" name="join_date" className="input-premium appearance-none custom-calendar-icon" value={formData.join_date} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Details */}
                        <div className="space-y-6 pt-8 border-t border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Allocation Details</h3>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1">Assigned Property</label>
                                    <select name="property_id" className="input-premium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat" value={formData.property_id} onChange={handlePropertyChange} required>
                                        <option value="">-- Choose Venue --</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.property_name} ({p.city})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1 italic flex justify-between">
                                        <span>Allocated Bed Space</span>
                                        {!formData.property_id ? (
                                            <span className="text-error tracking-normal font-normal">Select property first</span>
                                        ) : (
                                            <span className="text-primary tracking-normal font-normal">{rooms.length} Units Available</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="room_id"
                                            className={`input-premium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat ${!formData.property_id ? 'opacity-50' : ''}`}
                                            value={formData.room_id}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.property_id || fetchingRooms}
                                        >
                                            <option value="">{fetchingRooms ? 'Retrieving inventory...' : '-- Select Inventory --'}</option>
                                            {rooms.map(r => {
                                                const availableBeds = r.total_beds - r.occupied_beds;
                                                return (
                                                    <option key={r.id} value={r.id}>
                                                        Rm {r.room_number} • ({availableBeds}/{r.total_beds} BEDS FREE) • ₹{r.price}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {formData.property_id && rooms.length === 0 && !fetchingRooms && (
                                            <div className="mt-4 p-4 glass border-error/20 bg-error/5 rounded-2xl animate-fade">
                                                <p className="text-[10px] text-error font-bold uppercase tracking-widest text-center">
                                                    Infrastructure Full — No Available Inventory
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Document Matrix - Enhanced Media Capture */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-6">Document Matrix</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <button
                                    type="button" onClick={triggerCamera}
                                    className={`glass p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${uploadType === 'camera' ? 'border-accent bg-accent/5' : 'border-white/5 hover:bg-white/5'}`}
                                >
                                    <span className="text-2xl">📸</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Camera</span>
                                </button>
                                <button
                                    type="button" onClick={() => fileInputRef.current?.click()}
                                    className={`glass p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${uploadType === 'file' ? 'border-primary bg-primary/5' : 'border-white/5 hover:bg-white/5'}`}
                                >
                                    <span className="text-2xl">📁</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Local File</span>
                                </button>
                                <button
                                    type="button" onClick={() => setUploadType('drive')}
                                    className={`glass p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${uploadType === 'drive' ? 'border-success bg-success/5' : 'border-white/5 hover:bg-white/5'}`}
                                >
                                    <span className="text-2xl">☁️</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Cloud Drive</span>
                                </button>
                            </div>

                            <input
                                type="file" ref={fileInputRef} className="hidden"
                                accept="image/*,.pdf" onChange={handleFileChange}
                            />

                            {selectedDoc ? (
                                <div className="glass p-4 rounded-2xl border-white/10 flex items-center justify-between animate-fade">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📄</span>
                                        <div>
                                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{selectedDoc}</p>
                                            <p className="text-[8px] text-success uppercase font-black tracking-widest">System Linked</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { setSelectedDoc(null); setUploadType(null); }} className="text-error text-xs p-2">✕</button>
                                </div>
                            ) : uploadType === 'drive' ? (
                                <div className="glass p-6 rounded-2xl border-success/30 bg-success/5 text-center animate-fade">
                                    <p className="text-xs font-bold text-success mb-2">Google Drive Integration Meta-State</p>
                                    <button type="button" className="text-[10px] bg-success/20 text-success px-4 py-2 rounded-lg font-black uppercase tracking-widest">Authenticate Drive</button>
                                </div>
                            ) : (
                                <div className="glass p-8 rounded-[2rem] border-dashed border-white/5 flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white/40 mb-1">Awaiting Verification Document</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">AADHAAR / PAN / PASSPORT REQUIRED</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-10">
                            <button
                                type="submit"
                                className="btn-premium btn-primary w-full py-4.5 text-lg shadow-2xl shadow-primary/20 disabled:opacity-50"
                                disabled={loading || properties.length === 0 || !formData.room_id || formData.contact.length !== 10}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Processing Onboarding...
                                    </span>
                                ) : 'Complete Onboarding ✨'}
                            </button>
                            <p className="text-center mt-6 text-[10px] text-text-muted uppercase tracking-[0.4em] font-black opacity-40">Auto-credentials will be synced to resident</p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default RegisterTenantPage;
