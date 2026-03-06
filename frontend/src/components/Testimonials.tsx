import React, { useEffect, useRef } from "react";
import Card from "../common/Card.tsx";
import testimonialImage from "../assets/images/testimonial1.jpg";
import testimonialImage2 from "../assets/images/testimonial2.jpeg";

function Testimonials() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-up-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <>
      <style>
        {`
          .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          
          .fade-in-up-visible {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>
      
      <div className="container mt-5 text-center">
        <div className="row">
          <div className="col">
            <div ref={el => { cardRefs.current[0] = el; }} className="fade-in-up">
              <Card image={testimonialImage} />
            </div>
          </div>
          <div className="col">
            <div ref={el => { cardRefs.current[1] = el; }} className="fade-in-up">
              <Card image={testimonialImage2} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div ref={el => { cardRefs.current[2] = el; }} className="fade-in-up">
              <Card image={testimonialImage} />
            </div>
          </div>
          <div className="col">
            <div ref={el => { cardRefs.current[3] = el; }} className="fade-in-up">
              <Card image={testimonialImage} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Testimonials;