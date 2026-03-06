import React from "react";
import NavbarComp from "./components/NavbarComp.tsx";
import HeroComp from "./components/HeroComp.tsx";
import Card from "./common/Card.tsx";
import Testimonials from "./components/Testimonials.tsx";
import OfferingsSection from "./components/Offerings.tsx";
import Footer from "./components/Footer.tsx";
import "animate.css";

import PropertyList from "./components/PropertyList";

function LandingPage() {
  return (
    <div>
      <NavbarComp />
      <HeroComp />
      <PropertyList />
      <Testimonials />
      <OfferingsSection />
      <Footer />
    </div>
  );
}


export default LandingPage;
