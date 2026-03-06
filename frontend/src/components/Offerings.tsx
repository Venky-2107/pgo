import React, { useState } from 'react';

interface OfferingItem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface OfferingsData {
  [key: string]: OfferingItem[];
}

const OfferingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('amenities');

  const offeringsData: OfferingsData = {
    amenities: [
      { id: 1, icon: '🏠', title: 'Fully Furnished Rooms', description: 'Comfortable beds, study tables, wardrobes, and chairs' },
      { id: 2, icon: '🍽️', title: 'Meal Plans', description: 'Healthy meals with vegetarian and non-vegetarian options' },
      { id: 3, icon: '🧹', title: 'Housekeeping', description: 'Regular cleaning and maintenance services' },
      { id: 4, icon: '🚗', title: 'Parking Space', description: 'Secure parking for bikes and cars' }
    ],
    facilities: [
      { id: 1, icon: '🏋️', title: 'Gym Access', description: 'Fully equipped gymnasium for residents' },
      { id: 2, icon: '📶', title: 'High-Speed WiFi', description: 'Unlimited high-speed internet connectivity' },
      { id: 3, icon: '📺', title: 'Common TV Area', description: 'Spacious common area with television' },
      { id: 4, icon: '🧺', title: 'Laundry Service', description: 'Washing machines and drying facilities' }
    ],
    services: [
      { id: 1, icon: '🔒', title: '24/7 Security', description: 'CCTV surveillance and security personnel' },
      { id: 2, icon: '⚡', title: 'Power Backup', description: 'Uninterrupted power supply during outages' },
      { id: 3, icon: '💧', title: 'Water Supply', description: '24x7 hot and cold water availability' },
      { id: 4, icon: '🏥', title: 'Medical Assistance', description: 'First-aid and emergency medical support' }
    ]
  };

  return (
    <section className="py-5" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      filter: 'grayscale(70%)'
    }}>
      <div className="container">
        <div className="row text-center mb-5">
          <div className="col">
            <h2 className="display-4 fw-bold">What We Offer</h2>
            <p className="lead">Experience comfortable living with our premium amenities and services</p>
          </div>
        </div>

        <div className="row justify-content-center mb-4">
          <div className="col-md-8">
            <ul className="nav nav-pills justify-content-center">
              {Object.keys(offeringsData).map((tab) => (
                <li key={tab} className="nav-item">
                  <button
                    className={`nav-link mx-1 rounded-pill text-capitalize ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    style={{ 
                      backgroundColor: activeTab === tab ? 'white' : 'transparent',
                      color: activeTab === tab ? '#6f42c1' : 'white',
                      border: '2px solid rgba(255,255,255,0.5)',
                      cursor: 'pointer'
                    }}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="row">
          {offeringsData[activeTab].map((item: OfferingItem) => (
            <div key={item.id} className="col-md-6 col-lg-3 mb-4">
              <div className="card h-100 text-center border-0 shadow-lg">
                <div className="card-body d-flex flex-column">
                  <div className="display-4 mb-3">{item.icon}</div>
                  <h5 className="card-title fw-bold">{item.title}</h5>
                  <p className="card-text">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row text-center mt-4">
          <div className="col">
            <button className="btn btn-light btn-lg rounded-pill me-3 px-4">
              Book a Tour
            </button>
            <button className="btn btn-outline-light btn-lg rounded-pill px-4">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferingsSection;