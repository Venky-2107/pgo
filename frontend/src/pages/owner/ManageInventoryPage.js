import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ManageInventoryPage = () => {
    const { token } = useAuth();
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRoom, setEditingRoom] = useState(null);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [newRoom, setNewRoom] = useState({ room_number: '', sharing_type: 2, price: '', total_beds: 2 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProperties();
    }, [token]);

    const fetchProperties = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/owner/properties', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProperties(data.properties);
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async (propertyId) => {
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            const res = await fetch(`http://localhost:5000/api/owner/properties/${propertyId}/rooms`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRooms(data.rooms);
                const prop = properties.find(p => p.id === parseInt(propertyId));
                setSelectedProperty(prop);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`http://localhost:5000/api/owner/properties/${selectedProperty.id}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    room_number: newRoom.room_number,
                    sharing_type: parseInt(newRoom.sharing_type),
                    price: parseFloat(newRoom.price),
                    total_beds: parseInt(newRoom.sharing_type)
                })
            });
            if (res.ok) {
                setSuccess('Room added to inventory!');
                setShowAddRoom(false);
                setNewRoom({ room_number: '', sharing_type: 2, price: '', total_beds: 2 });
                fetchRooms(selectedProperty.id);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to add room');
            }
        } catch (err) {
            setError('Connection error. Is the backend running?');
        }
    };

    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`http://localhost:5000/api/owner/rooms/${editingRoom.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingRoom)
            });
            if (res.ok) {
                setSuccess('Inventory updated successfully!');
                setEditingRoom(null);
                fetchRooms(selectedProperty.id);
            } else {
                const data = await res.json();
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('System error. Try again.');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure? This will permanently remove this room from inventory.')) return;
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`http://localhost:5000/api/owner/rooms/${roomId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSuccess('Room removed.');
                fetchRooms(selectedProperty.id);
            } else {
                const data = await res.json();
                setError(data.message || 'Could not delete room');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    if (loading && properties.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 relative bg-background">
            <div className="container-premium max-w-5xl px-0">
                <header className="mb-12 animate-fade">
                    <Link to="/owner" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:opacity-80 transition-all no-underline">
                        <span>←</span> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight">Inventory <span className="text-gradient">Vault</span></h1>
                    <p className="text-text-muted mt-2">Add rooms, update pricing, sharing types, and bed counts for your property assets.</p>
                </header>

                {/* Status Messages */}
                {error && (
                    <div className="bg-error/10 border border-error/20 text-error p-4 rounded-2xl mb-6 flex items-center gap-3 animate-fade">
                        <span>⚠️</span> <p className="text-sm font-semibold">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-success/10 border border-success/20 text-success p-4 rounded-2xl mb-6 flex items-center gap-3 animate-fade">
                        <span>✅</span> <p className="text-sm font-semibold">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Property Selector */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary ml-1">Select Property</h3>
                        {properties.length === 0 ? (
                            <div className="glass p-8 rounded-2xl text-center">
                                <p className="text-text-muted text-sm">No properties yet.</p>
                                <Link to="/owner/add-property" className="text-primary text-xs font-bold mt-2 inline-block">+ List a Property</Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {properties.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => fetchRooms(p.id)}
                                        className={`w-full glass p-4 rounded-2xl text-left transition-all border ${selectedProperty?.id === p.id ? 'border-primary bg-primary/10' : 'border-white/5 hover:bg-white/5'}`}
                                    >
                                        <p className="font-bold text-sm">{p.property_name}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-tighter">{p.city} • {p.property_type}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Room List & Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        {!selectedProperty ? (
                            <div className="glass p-12 rounded-[2.5rem] text-center border-dashed border-white/5 bg-white/[0.01]">
                                <p className="text-text-muted uppercase tracking-widest font-black text-sm">Select a property to manage rooms</p>
                            </div>
                        ) : (
                            <div className="animate-fade">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <h2 className="text-xl font-black italic">{selectedProperty.property_name} — Rooms</h2>
                                    <button
                                        onClick={() => setShowAddRoom(!showAddRoom)}
                                        className="inline-flex items-center gap-2 text-xs font-black text-accent bg-accent/5 px-4 py-2.5 rounded-xl border border-accent/20 hover:bg-accent/10 transition-all uppercase tracking-widest"
                                    >
                                        {showAddRoom ? '✕ Cancel' : '+ Add Room'}
                                    </button>
                                </div>

                                {/* Add Room Form */}
                                {showAddRoom && (
                                    <form onSubmit={handleAddRoom} className="glass p-6 rounded-3xl border border-accent/20 mb-6 animate-fade">
                                        <h4 className="text-sm font-black text-accent mb-4 uppercase tracking-widest">New Room</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-text-muted ml-1">Room No</label>
                                                <input
                                                    type="text" className="input-premium py-2.5 px-3 text-sm" placeholder="e.g. 201"
                                                    value={newRoom.room_number}
                                                    onChange={e => setNewRoom({ ...newRoom, room_number: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-text-muted ml-1">Sharing</label>
                                                <select
                                                    className="input-premium py-2.5 px-3 text-sm"
                                                    value={newRoom.sharing_type}
                                                    onChange={e => setNewRoom({ ...newRoom, sharing_type: parseInt(e.target.value), total_beds: parseInt(e.target.value) })}
                                                >
                                                    <option value={1}>Solo (1)</option>
                                                    <option value={2}>Double (2)</option>
                                                    <option value={3}>Triple (3)</option>
                                                    <option value={4}>Hostel (4)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-text-muted ml-1">Price (₹)</label>
                                                <input
                                                    type="number" className="input-premium py-2.5 px-3 text-sm" placeholder="₹ 8000"
                                                    value={newRoom.price}
                                                    onChange={e => setNewRoom({ ...newRoom, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button type="submit" className="btn-premium btn-primary w-full py-2.5 text-sm rounded-xl">
                                                    Deploy Room
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {/* Room List */}
                                <div className="space-y-4">
                                    {rooms.length === 0 ? (
                                        <div className="glass p-10 rounded-3xl text-center border-dashed border-white/5">
                                            <p className="text-text-muted text-sm">No rooms configured. Click "+ Add Room" above.</p>
                                        </div>
                                    ) : (
                                        rooms.map(r => (
                                            <div key={r.id} className="glass p-5 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white/[0.04]">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black italic text-primary">
                                                        {r.room_number}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Room {r.room_number}</p>
                                                        <p className="text-[10px] text-text-muted uppercase tracking-widest">
                                                            {r.sharing_type}-Sharing • ₹{r.price} • {r.occupied_beds || 0}/{r.total_beds} Beds Occupied
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setEditingRoom({ ...r })}
                                                        className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(r.id)}
                                                        className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all text-sm"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editingRoom && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="glass-card max-w-md w-full p-8 animate-scale shadow-2xl overflow-visible relative">
                            <button onClick={() => { setEditingRoom(null); setError(''); }} className="absolute -top-3 -right-3 w-10 h-10 bg-error rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all text-white font-bold">✕</button>

                            <h3 className="text-2xl font-black mb-8">Update <span className="text-gradient">Room {editingRoom.room_number}</span></h3>

                            <form onSubmit={handleUpdateRoom} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1">Room Number</label>
                                    <input
                                        type="text" className="input-premium"
                                        value={editingRoom.room_number}
                                        onChange={e => setEditingRoom({ ...editingRoom, room_number: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-1">Sharing Type</label>
                                        <select
                                            className="input-premium"
                                            value={editingRoom.sharing_type}
                                            onChange={e => setEditingRoom({ ...editingRoom, sharing_type: parseInt(e.target.value), total_beds: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>Solo (1)</option>
                                            <option value={2}>Double (2)</option>
                                            <option value={3}>Triple (3)</option>
                                            <option value={4}>Hostel (4)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-1">Total Beds</label>
                                        <input
                                            type="number" className="input-premium bg-white/5"
                                            value={editingRoom.total_beds}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-muted ml-1">Price Per Bed (₹)</label>
                                    <input
                                        type="number" className="input-premium"
                                        value={editingRoom.price}
                                        onChange={e => setEditingRoom({ ...editingRoom, price: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-premium btn-primary w-full py-4 text-sm rounded-xl">Commit Changes ✨</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ManageInventoryPage;
