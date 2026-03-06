import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AddPropertyPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const [propertyData, setPropertyData] = useState({
        property_name: '',
        property_type: 'PG',
        property_email: '',
        property_contact: '',
        address_line1: '',
        city: '',
        state: '',
        pincode: '',
        gender: 'coed',
        description: '',
        amenities: []
    });

    const [rooms, setRooms] = useState([
        { room_number: '101', sharing_type: 2, price: 8500, total_beds: 2 }
    ]);

    const handlePropertyChange = (e) => {
        const { name, value } = e.target;
        if (name === 'property_contact') {
            const sanitized = value.replace(/\D/g, '').slice(0, 10);
            setPropertyData(prev => ({ ...prev, [name]: sanitized }));
        } else {
            setPropertyData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addRoomField = () => {
        setRooms([...rooms, { room_number: '', sharing_type: 1, price: '', total_beds: 1 }]);
    };

    const handleRoomChange = (index, field, value) => {
        const updatedRooms = [...rooms];
        updatedRooms[index][field] = value;
        if (field === 'sharing_type') {
            updatedRooms[index].total_beds = parseInt(value);
        }
        setRooms(updatedRooms);
    };

    const removeRoom = (index) => {
        setRooms(rooms.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^[0-9]{10}$/.test(propertyData.property_contact)) {
            setError('Please enter a valid 10-digit property contact number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const propRes = await fetch('http://localhost:5000/api/owner/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(propertyData)
            });

            const propData = await propRes.json();
            if (!propRes.ok) throw new Error(propData.message || 'Failed to create property');

            const propertyId = propData.property.id;

            for (const room of rooms) {
                await fetch(`http://localhost:5000/api/owner/properties/${propertyId}/rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(room)
                });
            }

            navigate('/owner', { replace: true });
        } catch (err) {
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-20 pb-12 px-4 relative bg-background">
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-3xl mx-auto container-premium px-0">
                {/* Header Section */}
                <header className="mb-10 animate-fade">
                    <Link to="/owner" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:opacity-80 transition-all no-underline">
                        <span>←</span> Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                                List Your <span className="text-gradient">Space</span>
                            </h1>
                            <p className="text-text-muted text-lg">Partner with PGO to manage your property seamlessly.</p>
                        </div>

                        {/* Progressive Steps */}
                        <div className="flex glass p-1.5 rounded-2xl border-white/5 shadow-inner">
                            <button
                                onClick={() => setStep(1)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${step === 1 ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                            >
                                1. Property
                            </button>
                            <button
                                onClick={() => propertyData.property_name && setStep(2)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${step === 2 ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white disabled:opacity-30'}`}
                                disabled={!propertyData.property_name}
                            >
                                2. Rooms
                            </button>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error p-5 rounded-2xl mb-8 flex items-center gap-3 animate-fade">
                        <span className="text-xl">⚠️</span>
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                )}

                <div className="glass-card p-6 md:p-12 animate-fade shadow-2xl relative overflow-hidden group">
                    {/* Decorative Blob */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-all duration-700"></div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        {step === 1 ? (
                            <div className="space-y-8">
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Property Name</label>
                                        <input
                                            type="text" name="property_name" className="input-premium focus:ring-primary/20"
                                            placeholder="e.g. Skyline Premium Residency" value={propertyData.property_name} onChange={handlePropertyChange} required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Type</label>
                                        <select name="property_type" className="input-premium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat" value={propertyData.property_type} onChange={handlePropertyChange}>
                                            <option value="PG">Premium PG</option>
                                            <option value="Hostel">Standard Hostel</option>
                                            <option value="Flat">Private Apartment</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Orientation</label>
                                        <select name="gender" className="input-premium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-no-repeat" value={propertyData.gender} onChange={handlePropertyChange}>
                                            <option value="coed">Unisex / Co-ed</option>
                                            <option value="male">Gents Only</option>
                                            <option value="female">Ladies Only</option>
                                        </select>
                                    </div>
                                </section>

                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <h3 className="md:col-span-2 text-sm font-bold text-primary mb-2">Location & Contact</h3>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Contact Email</label>
                                        <input type="email" name="property_email" className="input-premium" placeholder="hello@residency.com" value={propertyData.property_email} onChange={handlePropertyChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 flex justify-between">
                                            <span>Contact Phone</span>
                                            <span className={`${propertyData.property_contact.length === 10 ? 'text-success' : 'text-error'} tracking-normal text-[10px]`}>{propertyData.property_contact.length}/10</span>
                                        </label>
                                        <input type="text" name="property_contact" className="input-premium" placeholder="10-digit number" value={propertyData.property_contact} onChange={handlePropertyChange} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Full Address</label>
                                        <input type="text" name="address_line1" className="input-premium" placeholder="Building, Street Name, Landmark" value={propertyData.address_line1} onChange={handlePropertyChange} required />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 text-[10px]">City</label>
                                            <input type="text" name="city" className="input-premium py-3 px-3 sm:px-4" value={propertyData.city} onChange={handlePropertyChange} required />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 text-[10px]">State/Prov</label>
                                            <input type="text" name="state" className="input-premium py-3 px-3 sm:px-4" value={propertyData.state} onChange={handlePropertyChange} required />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 text-[10px]">Pincode</label>
                                            <input type="text" name="pincode" className="input-premium py-3 px-3 sm:px-4" value={propertyData.pincode} onChange={handlePropertyChange} required />
                                        </div>
                                    </div>
                                </section>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="btn-premium btn-primary w-full py-4.5 text-lg mt-10 rounded-2xl group shadow-2xl hover:scale-[1.01] active:scale-100"
                                >
                                    Proceed to Room Configuration <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                                    <h3 className="text-2xl font-black italic">Room Inventory</h3>
                                    <button
                                        type="button" onClick={addRoomField}
                                        className="inline-flex items-center gap-2 text-xs font-black text-accent bg-accent/5 px-4 py-2.5 rounded-xl border border-accent/20 hover:bg-accent/10 transition-all uppercase tracking-widest"
                                    >
                                        + Add New Room Type
                                    </button>
                                </div>

                                <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {rooms.map((room, index) => (
                                        <div key={index} className="glass p-5 rounded-3xl relative border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group/room">
                                            {rooms.length > 1 && (
                                                <button
                                                    type="button" onClick={() => removeRoom(index)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-error text-white shadow-xl flex items-center justify-center opacity-0 group-hover/room:opacity-100 transition-all hover:scale-110 z-20"
                                                >
                                                    ✕
                                                </button>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">Room No</label>
                                                    <input
                                                        type="text" className="input-premium py-2.5 px-3 text-sm" placeholder="e.g. 101"
                                                        value={room.room_number} onChange={(e) => handleRoomChange(index, 'room_number', e.target.value)} required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">Sharing</label>
                                                    <select
                                                        className="input-premium py-2.5 px-3 text-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M4%206L8%2010L12%206%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_0.75rem_center] bg-no-repeat"
                                                        value={room.sharing_type} onChange={(e) => handleRoomChange(index, 'sharing_type', e.target.value)}
                                                    >
                                                        <option value={1}>Solo (1)</option>
                                                        <option value={2}>Double (2)</option>
                                                        <option value={3}>Triple (3)</option>
                                                        <option value={4}>Hostel (4)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">Price (₹)</label>
                                                    <input
                                                        type="number" className="input-premium py-2.5 px-3 text-sm" placeholder="₹ 8,000"
                                                        value={room.price} onChange={(e) => handleRoomChange(index, 'price', e.target.value)} required
                                                    />
                                                </div>
                                                <div className="space-y-2 opacity-60">
                                                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">Total Beds</label>
                                                    <input
                                                        type="number" className="input-premium py-2.5 px-3 text-sm bg-surface-muted border-dashed"
                                                        value={room.total_beds} readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-10">
                                    <button
                                        type="button" onClick={() => setStep(1)}
                                        className="btn-premium glass py-4 rounded-2xl font-bold border-white/10 hover:bg-white/5"
                                    >
                                        ← Back to Info
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-premium btn-primary py-4 rounded-2xl text-lg font-black tracking-wide disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Launching...
                                            </span>
                                        ) : "Deploy Property ✨"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Visual Footer for Form purity */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-black">Powered by PGO Secure Infrastructure</p>
                </div>
            </div>
        </main>
    );
};

export default AddPropertyPage;
