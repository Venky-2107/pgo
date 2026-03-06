import React from "react";

function Card(props: any) {
  return (
    <div>
      <div className="card m-3 rounded-4 shadow-lg border-0">
        <div className="card-body text-center p-4">
          <div className="mb-3">
            <img
              src={props.image || "https://via.placeholder.com/80"}
              className="rounded-circle shadow"
              alt="Testimonial"
              width="80"
              height="80"
            />
          </div>
          <h5 className="card-title text-primary fw-bold">
            {props.name || "Customer Name"}
          </h5>
          <p className="card-text text-muted fst-italic">
            "
            {props.text ||
              "This is an amazing product! The service was exceptional and I would highly recommend to anyone looking for quality work."}
            "
          </p>
          <div className="text-warning mb-3">
            {[...Array(5)].map((_, i) => (
              <i key={i} className="fas fa-star"></i>
            ))}
          </div>
          <span className="text-muted small">
            {props.role || "Satisfied Customer"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Card;
