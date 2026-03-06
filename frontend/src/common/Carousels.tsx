import React from "react";

function Carousels() {
  interface CarouselItem {
    id: number;
    imageUrl: string;
    title: string;
    description: string;
  }
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      title: "Find Your Perfect PG Accommodation",
      description: "Comfortable living spaces in prime locations",
    },
    {
      id: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      title: "Affordable Monthly Rentals",
      description: "Quality living without breaking the bank",
    },
    {
      id: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      title: "All-Inclusive Amenities",
      description: "WiFi, laundry, meals and more included",
    },
  ];

  const goToNextSlide = (): void => {
    setCurrentSlide((prev) =>
      prev === carouselItems.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevSlide = (): void => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselItems.length - 1 : prev - 1
    );
  };

  // Auto-advance slides
  React.useEffect(() => {
    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <style>{`
        .carousel-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .carousel-fade-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }

        .carousel-fade-item.active {
          opacity: 1;
        }

        .carousel-fade-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
        }

        .carousel-caption {
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: white;
          z-index: 10;
          width: 80%;
          max-width: 800px;
        }

        .carousel-caption h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .carousel-caption p {
          font-size: 1.2rem;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.3s;
        }

        .carousel-nav:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .carousel-nav.prev {
          left: 20px;
        }

        .carousel-nav.next {
          right: 20px;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .carousel-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: background 0.3s;
        }

        .carousel-indicator.active {
          background: white;
        }

        @media (max-width: 768px) {
          .carousel-container {
            height: 400px;
          }

          .carousel-caption h2 {
            font-size: 1.8rem;
          }

          .carousel-caption p {
            font-size: 1rem;
          }

          .d-none {
            display: none !important;
          }

          .d-md-block {
            display: block !important;
          }
        }

        @media (min-width: 768px) {
          .d-md-block {
            display: block !important;
          }
        }
      `}</style>
      <div className="carousel-container">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`carousel-fade-item ${
              index === currentSlide ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          >
            <div className="carousel-caption d-none d-md-block">
              <h2 className="animate__animated animate__fadeInDown">{item.title}</h2>
              {/* <p className="animate__animated animate__fadeInUp">{item.description}</p>  */}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Carousels;
