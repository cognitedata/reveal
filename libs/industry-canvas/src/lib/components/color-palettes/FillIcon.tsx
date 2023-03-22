import React from 'react';

// Adapted from https://github.com/cognitedata/cogs.js/blob/master/src/Assets/SystemIcons/Icons/Circle.tsx

export const FillIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="8" fill={color} />
  </svg>
);
