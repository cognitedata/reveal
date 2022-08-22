import { WdlMeasurementType } from 'domain/wells/measurements/service/types';

import { MeasurementTypeParent } from '../types';

/**
 * WDL measurement types categorized into how we refer to them for processing
 * It seems like possible to eliminate this extra categorization after
 * verifying with owa-pipe-dev data
 */
export const MEASUREMENT_EXTERNAL_ID_CONFIG = {
  [MeasurementTypeParent.GEOMECHANNICS]: [
    WdlMeasurementType.GEOMECHANNICS,
    WdlMeasurementType.GEOMECHANNICS_POST_DRILL,
    WdlMeasurementType.GEOMECHANNICS_PRE_DRILL,
  ],
  [MeasurementTypeParent.PPFG]: [
    WdlMeasurementType.PRESSURE,
    WdlMeasurementType.PORE_PRESSURE,
    WdlMeasurementType.PORE_PRESSURE_PRE_DRILL,
    WdlMeasurementType.PORE_PRESSURE_PRE_DRILL_HIGH,
    WdlMeasurementType.PORE_PRESSURE_PRE_DRILL_LOW,
    WdlMeasurementType.PORE_PRESSURE_PRE_DRILL_MEAN,
    WdlMeasurementType.PORE_PRESSURE_POST_DRILL,
    WdlMeasurementType.PORE_PRESSURE_POST_DRILL_MEAN,
    WdlMeasurementType.FRACTURE_PRESSURE,
    WdlMeasurementType.FRACTURE_PRESSURE_PRE_DRILL,
    WdlMeasurementType.FRACTURE_PRESSURE_PRE_DRILL_HIGH,
    WdlMeasurementType.FRACTURE_PRESSURE_PRE_DRILL_LOW,
    WdlMeasurementType.FRACTURE_PRESSURE_PRE_DRILL_MEAN,
    WdlMeasurementType.FRACTURE_PRESSURE_POST_DRILL,
    WdlMeasurementType.FRACTURE_PRESSURE_POST_DRILL_MEAN,
  ],
  [MeasurementTypeParent.LOT]: [WdlMeasurementType.LOT],
  [MeasurementTypeParent.FIT]: [WdlMeasurementType.FIT],
};
