import React from 'react';

// Adapted from https://github.com/cognitedata/cogs.js/blob/master/src/Assets/SystemIcons/Icons/Circle.tsx

export const StrokeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="5" fill="none" stroke={color} strokeWidth="3" />
  </svg>
);
