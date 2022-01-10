import { log } from 'utils/log';

import { CogniteEvent, ExternalEvent, Sequence } from '@cognite/sdk';
import { NPT } from '@cognite/sdk-wells-v2';

import { FEET, LBM_OVER_BBL, METER, PPG, PSI, SG } from 'constants/units';

import { TrajectoryData, Wellbore, WellboreAssetIdMap } from '../types';

const PSI_TO_PPG_CONVERSION_FACTOR_FT = 0.052;
const LBM_BBL_TO_PPG_CONVERSION_FACTOR = 1 / 42;
const SG_TO_PPG_CONVERSION_FACTOR_FT = 8.33;
const PSI_TO_SG_CONVERSION_FACTOR_FT = 0.433;
const METER_TO_FEET_FACTOR = 3.281;

/**
 *
 * This is used to convert any value to ppg units
 */
export const convertToPpg = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string
) => {
  if (valueUnit === PPG) return value;

  let tvdInFeet = tvd || 1;
  if (tvdUnit === METER) {
    tvdInFeet *= METER_TO_FEET_FACTOR;
  }

  if (valueUnit === PSI) {
    return value / (tvdInFeet * PSI_TO_PPG_CONVERSION_FACTOR_FT);
  }

  if (valueUnit === LBM_OVER_BBL) {
    return value * LBM_BBL_TO_PPG_CONVERSION_FACTOR;
  }

  if (valueUnit === SG) {
    return value * SG_TO_PPG_CONVERSION_FACTOR_FT;
  }
  log(`Unit '${valueUnit}' is not recognized`);
  return value;
};

/**
 *
 * This is used to convert any value to psi units
 */
export const convertToPsi = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string
) => {
  if (valueUnit === PSI) return value;
  let tvdInFeet = tvd || 1;
  if (tvdUnit === METER) {
    tvdInFeet *= METER_TO_FEET_FACTOR;
  }
  const ppgValue = convertToPpg(value, valueUnit, tvdInFeet, FEET);
  return ppgValue * tvdInFeet * PSI_TO_PPG_CONVERSION_FACTOR_FT;
};

/**
 *
 * This is used to convert any value to SG units
 */
export const convertToSG = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string
) => {
  if (valueUnit === SG) return value;
  let tvdInFeet = tvd || 1;
  if (tvdUnit === METER) {
    tvdInFeet *= METER_TO_FEET_FACTOR;
  }
  const psiValue = convertToPsi(value, valueUnit, tvdInFeet, FEET);
  return psiValue / tvdInFeet / PSI_TO_SG_CONVERSION_FACTOR_FT;
};

export const convertPressure = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string,
  convertToUnit?: string
) => {
  switch (convertToUnit) {
    case PPG:
      return convertToPpg(value, valueUnit, tvd, tvdUnit);
    case PSI:
      return convertToPsi(value, valueUnit, tvd, tvdUnit);
    case SG:
      return convertToSG(value, valueUnit, tvd, tvdUnit);
    default: {
      if (convertToUnit) {
        log(`Unit '${convertToUnit}' is not recognized`);
      }
      return value;
    }
  }
};

export const trimCachedData = (
  data: {
    [key: string]:
      | Sequence[]
      | CogniteEvent[]
      | TrajectoryData[]
      | ExternalEvent[]
      | NPT[];
  },
  wellboreIds: Wellbore['id'][]
) => {
  const newIds: Wellbore['id'][] = [];
  const trimmedData = wellboreIds.reduce((results, wellboreId) => {
    if (data[wellboreId]) {
      return { ...results, [wellboreId]: data[wellboreId] };
    }
    newIds.push(wellboreId);
    return results;
  }, {} as typeof data);
  return {
    trimmedData,
    newIds,
  };
};

export const getWellboreAssetIdReverseMap = (
  wellboreAssetIdMap: WellboreAssetIdMap
) => {
  return Object.keys(wellboreAssetIdMap)
    .map((key) => Number(key))
    .reduce(
      (idMap, wellboreId) => ({
        ...idMap,
        [wellboreAssetIdMap[wellboreId]]: wellboreId,
      }),
      {} as WellboreAssetIdMap
    );
};

export const mapLogType = (sequences: Sequence[], logType: string) =>
  sequences.map((sequence) => ({ ...sequence, logType }));
