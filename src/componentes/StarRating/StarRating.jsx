import React from 'react';
import './StarRating.css';

function StarRating({ level }) {
  const maxStars = 5;
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= level) {
      stars.push(<span key={i} className="star filled">&#9733;</span>); // filled star
    } else {
      stars.push(<span key={i} className="star">&#9734;</span>); // empty star
    }
  }

  return <div className="star-rating">{stars}</div>;
}

export default StarRating;
