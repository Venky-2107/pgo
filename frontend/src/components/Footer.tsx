import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">PG Residence</h5>
            <p className="  ">
              Providing comfortable and affordable accommodation for students
              and professionals with premium amenities and services.
            </p>
            <div className="d-flex mt-4">
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="col-md-2 mb-4">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  About Us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Amenities
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Gallery
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h5 className="fw-bold mb-3">Our Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Fully Furnished Rooms
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Meal Plans
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  Housekeeping
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  24/7 Security
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none   ">
                  High-Speed WiFi
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h5 className="fw-bold mb-3">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2   ">
                <i className="fas fa-map-marker-alt me-2"></i> 123 PG Street,
                City, State
              </li>
              <li className="mb-2   ">
                <i className="fas fa-phone me-2"></i> +1 (123) 456-7890
              </li>
              <li className="mb-2   ">
                <i className="fas fa-envelope me-2"></i> info@pgresidence.com
              </li>
            </ul>

            <div className="mt-4">
              <h6 className="fw-bold">Subscribe to Newsletter</h6>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="Your email"
                />
                <button className="btn btn-primary btn-sm" type="button">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="   mb-0">
              &copy; {currentYear} PG Residence. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="#" className="text-decoration-none   me-3">
              Privacy Policy
            </a>
            <a href="#" className="text-decoration-none   me-3">
              Terms of Service
            </a>
            <a href="#" className="text-decoration-none  ">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
