import { PlotData } from 'plotly.js';

const DEFAULT_COLOR = '#595959';

export const getDifferenceCurveConfig = (
  color = DEFAULT_COLOR
): Partial<PlotData> => {
  return {
    line: {
      color,
      dash: 'dashdot',
    },
  };
};
