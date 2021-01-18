import React from 'react';
import { Colors } from '@cognite/cogs.js';
import { StyledFigure } from './elements';

const INITIAL_OFFSET = 25;
const circleConfig = {
  viewBox: '0 0 38 38',
  x: '19',
  y: '19',
  radio: '15.91549430918954',
};

type Props = {
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  innerText?: string;
  legendText?: string;
  percentage: number;
  trailStrokeWidth?: number;
  trailStrokeColor?: string;
  trailSpaced?: boolean;
  // speed?: number;
  maxWidth?: number;
  showPercentageText?: boolean;
};

const CircleProgressBar = ({
  className,
  strokeColor = 'blueviolet',
  strokeWidth = 4,
  innerText,
  legendText,
  percentage,
  trailStrokeWidth = 4,
  trailStrokeColor = Colors['greyscale-grey5'].hex(),
  trailSpaced = false,
  maxWidth = 46,
  showPercentageText = true,
}: Props) => (
  <StyledFigure maxW={maxWidth} className={className}>
    <svg viewBox={circleConfig.viewBox}>
      <circle
        className="donut-ring"
        cx={circleConfig.x}
        cy={circleConfig.y}
        r={circleConfig.radio}
        fill="transparent"
        stroke={trailStrokeColor}
        strokeWidth={trailStrokeWidth}
        strokeDasharray={trailSpaced ? 1 : 0}
      />

      <circle
        className="donut-segment"
        cx={circleConfig.x}
        cy={circleConfig.y}
        r={circleConfig.radio}
        fill="transparent"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={`${percentage} ${100 - percentage}`}
        strokeDashoffset={INITIAL_OFFSET}
      />
      {showPercentageText && (
        <g className="chart-text">
          <text x="50%" y="50%" className="chart-number">
            {percentage}%
          </text>
          {innerText && (
            <text x="50%" y="50%" className="chart-label">
              {innerText}
            </text>
          )}
        </g>
      )}
    </svg>
    {legendText && (
      <figcaption className="figure-key">
        <ul className="figure-key-list" aria-hidden="true" role="presentation">
          <li>
            <span className="shape-circle" />
            <span>{legendText}</span>
          </li>
        </ul>
      </figcaption>
    )}
  </StyledFigure>
);

export default CircleProgressBar;
