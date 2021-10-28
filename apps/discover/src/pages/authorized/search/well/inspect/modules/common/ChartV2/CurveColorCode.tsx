import { Dash, PlotData } from 'plotly.js';

export const DASH_CSS_MAP = {
  solid: '0',
  dot: '0 2',
  dash: '2',
  dashdot: '2 0 2',
  longdash: '2',
  longdashdot: '2 0 2',
};

const CurveColorCode = ({ line, marker }: Partial<PlotData>) => {
  if (marker) {
    const color = (marker.color as string).replace('_', '');
    return (
      <svg height="16" width="24">
        <path
          data-testid="chart-symbol"
          transform="translate(12,11)"
          d="M-9.24,4H9.24L0,-8Z"
          stroke={color}
          strokeWidth={marker.line?.width as number}
          fill={marker.symbol?.toString().endsWith('up-open') ? 'none' : color}
        />
      </svg>
    );
  }
  if (line) {
    return (
      <svg height="16" width="14">
        <line
          data-testid="chart-line"
          x1="2"
          y1="8"
          x2="12"
          y2="8"
          stroke={(line.color as string).replace('_', '')}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={DASH_CSS_MAP[line.dash as Dash]}
        />
      </svg>
    );
  }
  return null;
};

export default CurveColorCode;
