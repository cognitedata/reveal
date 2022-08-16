import { MeasurementCurveConfig, MeasurementType } from '../types';

/**
 * Plotly config ( color, line etc) categorized by measurement type
 */
export const MEASUREMENT_CURVE_CONFIG: MeasurementCurveConfig = {
  [MeasurementType.GEOMECHANNICS]: {
    // FDD external id's
    GEO: { line: { color: '#C13670', dash: 'solid' } },
    GEO_PRE_DRILL: { line: { color: '#C13670', dash: 'dashdot' } },
    GEO_POST_DRILL: { line: { color: '#18AF8E', dash: 'solid' } },
    // owa-stage columns
    SHMIN_SHALE_ML_PRE: { line: { color: '#C13670', dash: 'solid' } },
    SHMIN_SHALE_POST: { line: { color: '#C13670', dash: 'dashdot' } },
    FRICTION_ANGLE_PRE: { line: { color: '#18AF8E', dash: 'solid' } },
    FRICTION_ANGLE_POST: { line: { color: '#18AF8E', dash: 'dashdot' } },
    ROCK_STRENGTH_UCS_PRE: { line: { color: '#6E85FC', dash: 'solid' } },
    ROCK_STRENGTH_UCS_POST: { line: { color: '#6E85FC', dash: 'dashdot' } },
    SHMAX_MAGNITUDE_PRE: { line: { color: '#FFB38B', dash: 'solid' } },
    SHMAX_MAGNITUDE_POST: { line: { color: '#FFB38B', dash: 'dashdot' } },
    SHMIN_SAND_ML_PRE: { line: { color: '#FD5190', dash: 'solid' } },
    SHMIN_SAND_POST: { line: { color: '#FD5190', dash: 'dashdot' } },
    SHMAX_AZIMUTH_PRE: { line: { color: '#CC512B', dash: 'solid' } },
    // SHMAX_AZIMUTH_POST: { line: { color: '#CC512B', dash: 'dashdot' } },
    // DTCO_POST: { line:{ color: '#D46AE2', dash: 'dashdot' }},
    YM_POST: { line: { color: '#8D1E47', dash: 'dashdot' } },
    CP_POST: { line: { color: '#078D79', dash: 'dashdot' } },
    ESD_POST: { line: { color: '#EB9B00', dash: 'dashdot' } },
    ECD_ACTUAL: { line: { color: '#2B3A88', dash: 'solid' } },
    CP_90_30_PRE: { line: { color: '#24D8ED', dash: 'solid' } },
    // PSEUDO_SONIC_PRE: { color: '#00665C', dash: 'solid' }},
    CP_ZERO_PRE: { line: { color: '#0F6D8A', dash: 'solid' } },
    CP_P90_PRE: { line: { color: '#D27200', dash: 'solid' } },
    CP_P10_PRE: { line: { color: '#642175', dash: 'solid' } },
    CP_P50_PRE: { line: { color: '#6ED8BE', dash: 'solid' } },
    default: { line: { color: '#EB9B00', dash: 'solid' } },
  },
  [MeasurementType.PPFG]: {
    // FDD external id's
    PP: { line: { color: '#B30539', dash: 'solid' } },
    PP_PRE_DRILL: { line: { color: '#B30539', dash: 'dashdot' } },
    PP_PRE_DRILL_NOW: { line: { color: '#50E0F1', dash: 'solid' } },
    PP_POST_DRILL: { line: { color: '#50E0F1', dash: 'dashdot' } },
    PP_POST_DRILL_MEAN: { line: { color: '#4255BB', dash: 'solid' } },
    FP: { line: { color: '#4255BB', dash: 'dot' } },
    FP_POST_DRILL: { line: { color: '#4255BB', dash: 'dash' } },
    FP_POST_DRILL_MEAN: { line: { color: '#4255BB', dash: 'dashdot' } },
    FP_PRE_DRILL_HIGH: { line: { color: '#C945DB', dash: 'solid' } },
    // owa-stage columns

    SVERTICAL_PRE: { line: { color: '#B30539', dash: 'solid' } },
    SVERTICAL_POST: { line: { color: '#B30539', dash: 'dashdot' } },
    PNORM_PRE: { line: { color: '#50E0F1', dash: 'solid' } },
    PNORM_POST: { line: { color: '#50E0F1', dash: 'dashdot' } },
    PP_COMPOSITE_ML: { line: { color: '#4255BB', dash: 'solid' } },
    PP_COMPOSITE_LOW: { line: { color: '#4255BB', dash: 'dot' } },
    PP_COMPOSITE_HIGH: { line: { color: '#4255BB', dash: 'dash' } },
    PP_COMPOSITE_POST: { line: { color: '#4255BB', dash: 'dashdot' } },
    FP_COMPOSITE_ML: { line: { color: '#C945DB', dash: 'solid' } },
    FP_COMPOSITE_LOW: { line: { color: '#C945DB', dash: 'dot' } },
    FP_COMPOSITE_HIGH: { line: { color: '#C945DB', dash: 'dash' } },
    FP_COMPOSITE_POST: { line: { color: '#C945DB', dash: 'dashdot' } },
    FP_SHALE_ML: { line: { color: '#D51A46', dash: 'solid' } },
    FP_SHALE_LOW: { line: { color: '#D51A46', dash: 'dot' } },
    FP_SHALE_HIGH: { line: { color: '#D51A46', dash: 'dash' } },
    FP_SHALE_POST: { line: { color: '#D51A46', dash: 'dashdot' } },
    PP_SHALE_ML: { line: { color: '#FFBB00', dash: 'solid' } },
    PP_SHALE_LOW: { line: { color: '#FFBB00', dash: 'dot' } },
    PP_SHALE_HIGH: { line: { color: '#FFBB00', dash: 'dash' } },
    PP_SHALE_POST: { line: { color: '#FFBB00', dash: 'dashdot' } },
    FP_SAND_ML: { line: { color: '#FF6918', dash: 'solid' } },
    FP_SAND_LOW: { line: { color: '#FF6918', dash: 'dot' } },
    FP_SAND_HIGH: { line: { color: '#FF6918', dash: 'dash' } },
    FP_SAND_POST: { line: { color: '#FF6918', dash: 'dashdot' } },
    PP_SAND_ML: { line: { color: '#FC2574', dash: 'solid' } },
    PP_SAND_LOW: { line: { color: '#FC2574', dash: 'dot' } },
    PP_SAND_HIGH: { line: { color: '#FC2574', dash: 'dash' } },
    PP_SAND_POST: { line: { color: '#FC2574', dash: 'dashdot' } },
    FP_ACHIEVABLE_ML: { line: { color: '#1AA3C1', dash: 'solid' } },
    FP_ACHIEVABLE_LOW: { line: { color: '#1AA3C1', dash: 'dot' } },
    FP_ACHIEVABLE_HIGH: { line: { color: '#1AA3C1', dash: 'dash' } },
    FP_ACHIEVABLE_POST: { line: { color: '#1AA3C1', dash: 'dashdot' } },
    default: { line: { color: '#B30539', dash: 'solid' } },
  },
  [MeasurementType.FIT]: {
    default: {
      marker: {
        color: '#595959',
        size: 20,
        symbol: 'triangle-up-open',
        line: {
          width: 2,
        },
      },
    },
  },
  [MeasurementType.LOT]: {
    default: {
      marker: {
        color: '#595959',
        size: 2,
        symbol: 'triangle-up',
        line: {
          width: 2,
        },
      },
    },
  },
};
