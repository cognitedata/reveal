import { GetAllInspectDataProps } from 'domain/wells/types';

import { FetchOptions } from 'utils/fetchAllCursors';

import { DistanceUnitEnum } from '@cognite/sdk-wells';

export type GetDepthMeasurementsProps = GetAllInspectDataProps &
  MeasurementTypeFilter;

export interface GetDepthMeasurementDataProps extends MeasurementTypeFilter {
  sequenceExternalId: string;
  unit?: DistanceUnitEnum;
  options?: FetchOptions;
}

export interface MeasurementTypeFilter {
  measurementTypes?: Array<WdlMeasurementType>;
}

export interface MeasurementsFetchOptions {
  withTvd?: boolean;
}

export interface SequenceExternalIdFilter {
  sequenceExternalIds: Array<string>;
}

export enum WdlMeasurementType {
  GEOMECHANNICS = 'geomechanics',
  GEOMECHANNICS_PRE_DRILL = 'geomechanics pre drill',
  GEOMECHANNICS_POST_DRILL = 'geomechanics post drill',
  PRESSURE = 'pressure',
  PORE_PRESSURE = 'pore pressure',
  PORE_PRESSURE_PRE_DRILL = 'pore pressure pre drill',
  PORE_PRESSURE_PRE_DRILL_HIGH = 'pore pressure pre drill high',
  PORE_PRESSURE_PRE_DRILL_LOW = 'pore pressure pre drill low',
  PORE_PRESSURE_PRE_DRILL_MEAN = 'pore pressure pre drill mean',
  PORE_PRESSURE_POST_DRILL = 'pore pressure post drill',
  PORE_PRESSURE_POST_DRILL_MEAN = 'pore pressure post drill mean',
  FRACTURE_PRESSURE = 'fracture pressure',
  FRACTURE_PRESSURE_PRE_DRILL = 'fracture pressure pre drill',
  FRACTURE_PRESSURE_PRE_DRILL_HIGH = 'fracture pressure pre drill high',
  FRACTURE_PRESSURE_PRE_DRILL_LOW = 'fracture pressure pre drill low',
  FRACTURE_PRESSURE_PRE_DRILL_MEAN = 'fracture pressure pre drill mean',
  FRACTURE_PRESSURE_POST_DRILL = 'fracture pressure post drill',
  FRACTURE_PRESSURE_POST_DRILL_MEAN = 'fracture pressure post drill mean',
  LOT = 'lot equivalent mud weight',
  FIT = 'fit equivalent mud weight',
  GAMMA_RAY = 'gamma ray',
  CALIPER = 'caliper',
  DEEP_RESISTIVITY = 'deep resistivity',
  MEDIUM_RESISTIVITY = 'medium resistivity',
  MICRO_RESISTIVITY = 'micro resistivity',
  SHALLOW_RESISTIVITY = 'shallow resistivity',
  DENSITY = 'density',
  NEUTRON_POROSITY = 'neutron porosity',
  MUD_TYPE = 'mud type',
}
