import React from 'react';

const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_RADIUS = 8 - DEFAULT_STROKE_WIDTH / 2;

export type CircleIconProps = {
  stroke?: string;
  fill?: string;
  radius?: number;
  strokeWidth?: number;
};

export const CircleIcon: React.FC<CircleIconProps> = ({
  fill = 'none',
  stroke = 'none',
  strokeWidth = DEFAULT_STROKE_WIDTH,
  radius = DEFAULT_RADIUS,
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="8"
      cy="8"
      r={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  </svg>
);
