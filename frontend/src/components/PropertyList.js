import React, { useState, useEffect } from 'react';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async (searchCity = '') => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/public/properties?city=${searchCity}`);
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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProperties(city);
    };

    return (
        <section className="py-24 relative overflow-hidden" id="browse">
            {/* Background layers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] -z-10 rounded-full animate-pulse"></div>

            <div className="container-premium px-4 sm:px-8">
                <div className="text-center mb-16 animate-fade">
                    <div className="inline-block glass px-4 py-1.5 rounded-full border-white/5 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Inventory</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
                        Premium <span className="text-gradient">Residencies</span>
                    </h2>
                    <p className="text-text-muted max-w-xl mx-auto font-medium">
                        Explore hand-picked, secure, and modern accommodations
                        designed for the modern workforce.
                    </p>
                </div>

                {/* Search Architecture */}
                <form onSubmit={handleSearch} className="mb-24 max-w-2xl mx-auto animate-fade">
                    <div className="glass p-2 rounded-[2.5rem] flex flex-col md:flex-row gap-2 shadow-2xl border-white/10 relative group">
                        <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex-grow">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl grayscale opacity-50">📍</span>
                            <input
                                type="text"
                                className="input-premium pl-14 border-none bg-transparent py-5 text-lg placeholder:text-text-muted/50"
                                placeholder="Search City Layer (e.g. Hyderabad)"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-premium btn-primary px-10 py-5 rounded-[2rem] font-black tracking-tight text-lg shadow-xl shadow-primary/20">
                            Search Infrastructure
                        </button>
                    </div>
                </form>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-text-muted animate-pulse">Syncing Property Database...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {properties.map((prop, index) => (
                            <div
                                key={prop.id}
                                className="glass-card overflow-hidden group hover:scale-[1.03] transition-all duration-500 animate-fade relative"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="relative h-72 overflow-hidden">
                                    {/* Sophisticated Placeholder */}
                                    <div className="w-full h-full bg-gradient-to-br from-surface to-surface-muted flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]"></div>
                                        <span className="text-7xl group-hover:scale-125 transition-transform duration-700 opacity-20 grayscale">🏢</span>
                                    </div>
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
                                            {prop.property_type}
                                        </span>
                                        <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-success border-success/20 bg-success/5">
                                            SECURE
                                        </span>
                                    </div>
                                    <div className="absolute bottom-6 right-6 glass px-5 py-3 rounded-2xl text-white font-black backdrop-blur-2xl border border-white/10 shadow-2xl">
                                        <span className="text-[10px] text-text-muted font-bold mr-1 italic">Starts</span>
                                        ₹{prop.price_min || '6,500'}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">📍 {prop.city}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{prop.gender}</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-6 tracking-tight group-hover:text-primary transition-colors leading-tight">
                                        {prop.property_name}
                                    </h3>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex gap-4 text-xl opacity-40">
                                            <span title="High-Speed WiFi">⚡</span>
                                            <span title="Climate Control">❄️</span>
                                            <span title="Gourmet Food">🍱</span>
                                        </div>
                                        <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                            View Spaces →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && properties.length === 0 && (
                    <div className="text-center py-32 glass rounded-[3rem] border-dashed border-white/10 animate-fade">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl mx-auto mb-6">🔍</div>
                        <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">Zero Results Found</h4>
                        <p className="text-text-muted max-w-sm mx-auto text-sm leading-relaxed">
                            Infrastructure expansion in progress. Register for alerts in your coordinates.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PropertyList;
