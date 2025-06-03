import React, { useState, useEffect } from 'react';
import './StarRating.css';

function StarRating({ level, editable = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(level);
  const maxStars = 5;
  const stars = [];

  useEffect(() => {
    setSelected(level);
  }, [level]);

  const handleClick = (newLevel) => {
    if (editable && onChange) {
      setSelected(newLevel);
      onChange(newLevel);
      setHovered(0); // Reset hover on click to fix visual persistence
    }
  };

  const handleMouseEnter = (index) => {
    if (editable) {
      setHovered(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHovered(0);
    }
  };

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= (hovered || selected);
    stars.push(
      <span
        key={i}
        className={`star ${isFilled ? 'filled' : ''}`}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: editable ? 'pointer' : 'default' }}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        onKeyDown={(e) => {
          if (editable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(i);
          }
        }}
        aria-label={`Set rating to ${i} star${i > 1 ? 's' : ''}`}
      >
        {isFilled ? '\u2605' : '\u2606'}
      </span>
    );
  }

  return <div className="star-rating">{stars}</div>;
}

export default StarRating;
