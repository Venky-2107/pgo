import React from "react";

const SearchFormComp: React.FC = () => {
  // Add missing state and handlers for controlled components
  const [searchQuery, setSearchQuery] = React.useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setSearchQuery((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search logic here
    console.log("Searching:", searchQuery);
  };

  return (
    // Search Form
    <div className="search-box card shadow-lg">
      <div className="card-body">
        <form onSubmit={handleSearch}>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  placeholder="Enter city or area"
                  value={searchQuery.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label htmlFor="checkIn" className="form-label">
                  Check-in
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="checkIn"
                  value={searchQuery.checkIn}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label htmlFor="checkOut" className="form-label">
                  Check-out
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="checkOut"
                  value={searchQuery.checkOut}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label htmlFor="guests" className="form-label">
                  Guests
                </label>
                <select
                  className="form-select"
                  id="guests"
                  value={searchQuery.guests}
                  onChange={handleInputChange}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                type="submit"
                className="btn btn-primary w-100 btn-search"
              >
                <i className="fas fa-search me-2"></i> Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchFormComp;
