import { PlotData } from 'plotly.js';

import { TrajectoryCurve } from './types';

export const TRAJECTORY_CURVES_MD = [
  TrajectoryCurve.MD_ED,
  TrajectoryCurve.NS_EW,
];

export const TRAJECTORY_CURVES_TVD = [
  TrajectoryCurve.TVD_ED,
  TrajectoryCurve.NS_EW,
];

export const NATIVE_SCALE_CURVES = [TrajectoryCurve.NS_EW];

export const CURVES_TO_SHOW_KICKOFF_POINT = [
  TrajectoryCurve.MD_ED,
  TrajectoryCurve.TVD_ED,
];

export const KICK_OFF_POINT_MARKER_SIZE = 10;
export const INCLINATION_MARKER_SIZE = 8;

export const TRAJECTORY_SECONDARY_DATA_COMMON_PROPS: Partial<PlotData> = {
  mode: 'text+markers',
  textfont: {
    family: 'Inter',
    size: 10,
    color: '#000000',
  },
  hoverinfo: 'y',
};
