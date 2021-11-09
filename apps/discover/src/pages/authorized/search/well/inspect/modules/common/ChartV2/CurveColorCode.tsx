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
          transform="translateX(-4)"
          d="M11.0949 6.28971C12.0199 4.28715 12.4823 3.28587 13.1206 2.97339C13.6754 2.7018 14.3246 2.7018 14.8794 2.97339C15.5177 3.28587 15.9801 4.28715 16.9051 6.28971L18.8304 10.4582C19.5281 11.9688 19.877 12.7241 19.7731 13.3351C19.6824 13.869 19.379 14.3433 18.9324 14.6495C18.4212 15 17.5893 15 15.9253 15H12.0747C10.4107 15 9.57877 15 9.06757 14.6495C8.62095 14.3433 8.3176 13.869 8.22686 13.3351C8.123 12.7241 8.47186 11.9688 9.16957 10.4582L11.0949 6.28971Z"
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
