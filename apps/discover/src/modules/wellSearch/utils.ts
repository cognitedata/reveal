import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import proj4 from 'proj4';

import { Asset, Sequence } from '@cognite/sdk';
import { SpudDateLimits, WaterDepthLimits } from '@cognite/sdk-wells-v2';

import {
  endOf,
  getDateByMatchingRegex,
  isValidDate,
  startOf,
} from '_helpers/date';
import { log } from '_helpers/log';
import { UnitConverterItem } from '_helpers/units/interfaces';
import {
  changeUnit,
  changeUnits as changeSomeUnits,
  changeUnitTo,
} from '_helpers/units/utils';
import { TableResults } from 'components/tablev2';
import { FEET, UserPrefferedUnit } from 'constants/units';
import { proj4Defs } from 'modules/map/proj4Defs';
import { convertToClosestInteger } from 'pages/authorized/search/well/inspect/modules/events/common';

import { NPTEvent, Well, Wellbore, WellSequence } from './types';

const defaultUnknownValue = 'Unknown';

proj4.defs(Object.keys(proj4Defs).map((key) => [key, proj4Defs[key]]));

export const toWellbore = (input: Asset): Partial<Wellbore> => {
  return {
    id: input.id,
    name: input.name,
    metadata: {
      WELLBORE_TYPE: input.metadata?.WELLBORE_TYPE || defaultUnknownValue,
      CURRENT_STATUS: input.metadata?.CURRENT_STATUS || defaultUnknownValue,
      CONTENT: input.metadata?.CONTENT || defaultUnknownValue,
    },
  };
};

export const toWellSequence = (input: Sequence): WellSequence => {
  return {
    id: input.id,
    name: input.name || '',
    metadata: {
      subtype: input.metadata?.subtype || '',
      type: input.metadata?.type || '',
      source: input.metadata?.source || '',
      fileType: input.metadata?.fileType || '',
    },
  };
};

export const normalizeCoords = (
  x: string | number = 0,
  y: string | number = 0,
  crs: string
): Partial<Well> => {
  if (!crs) return {};
  const CRS = crs.toUpperCase();
  if (CRS === 'WGS84') {
    return {
      geometry: {
        type: 'Point',
        coordinates: [Number(x), Number(y)],
      },
    };
  }
  if (proj4Defs[CRS]) {
    try {
      const [normalizedX, normalizedY] = proj4(crs.toUpperCase()).inverse([
        Number(x),
        Number(y),
      ]);
      if (normalizedX && normalizedY) {
        return {
          geometry: {
            type: 'Point',
            coordinates: [normalizedX, normalizedY],
          },
        };
      }
    } catch (error) {
      log('Error during tranforming coordinates', String(error));
    }
  } else {
    log('proj4 Defs Not found :', crs);
  }
  return {};
};

export const convertToFixedDecimal = <Item>(
  dataObj: Item,
  accessors: string[]
): Item => {
  const copiedEvent = { ...dataObj };
  accessors.forEach((accessor) => {
    const numValue = Number(get(dataObj, accessor));
    if (!Number.isNaN(numValue)) {
      set(
        copiedEvent as unknown as Record<string, unknown>,
        accessor,
        numValue.toFixed(2)
      );
    }
  });
  return copiedEvent;
};

export const convertTimeStampsToDates = <Item>(
  dataObj: Item,
  accessors: string[]
) => {
  const copiedEvent = { ...dataObj };
  accessors.forEach((accessor) => {
    const date = get(dataObj, accessor);
    set(
      copiedEvent as unknown as Record<string, unknown>,
      accessor,
      getDateByMatchingRegex(date)
    );
  });
  return copiedEvent;
};

export const convertObject = <Item>(object: Item) => {
  let clonedObj = cloneDeep(object);
  const allFunctions = {
    toFixedDecimals: (accessors: string[]) => {
      clonedObj = convertToFixedDecimal(clonedObj, accessors);
      return allFunctions;
    },
    toClosestInteger: (accessors: string[]) => {
      clonedObj = convertToClosestInteger(clonedObj, accessors);
      return allFunctions;
    },
    toDate: (accessors: string[]) => {
      clonedObj = convertTimeStampsToDates(clonedObj, accessors);
      return allFunctions;
    },
    changeUnits: (unitAccessors: UnitConverterItem[]) => {
      clonedObj = changeSomeUnits(clonedObj, unitAccessors);
      return allFunctions;
    },
    add: (extraValues: { [key: string]: any }) => {
      clonedObj = { ...clonedObj, ...extraValues };
      return allFunctions;
    },
    get: () => clonedObj,
  };
  return allFunctions;
};

// @sdk-wells-v3
export const getPrestineWellIds = (
  selectedWellIds: TableResults,
  wells: Well[]
) => {
  return Object.keys(selectedWellIds).filter((wellId) => {
    if (selectedWellIds[wellId]) {
      // make sure to exclude already loaded wellbores
      const resultWell = wells.find((well) => String(well.id) === wellId);
      if (resultWell && !resultWell.wellbores) return true;
    }
    return false;
  }) as unknown as number[];
};

export const getWaterDepthLimitsInUnit = (
  waterDepthLimits: WaterDepthLimits,
  preferredUnit: string
) => {
  const config = {
    accessor: 'value',
    fromAccessor: 'unit',
    to: preferredUnit,
  };
  const min = changeUnit(waterDepthLimits.min, config).value;
  const max = changeUnit(waterDepthLimits.max, config).value;
  return [Math.floor(min), Math.ceil(max)];
};

export const getRangeLimitInUnit = (
  limitMin: number,
  limitMax: number,
  preferredUnit: UserPrefferedUnit
) => {
  if (preferredUnit === FEET) return [limitMin, limitMax];
  return [
    Math.floor(changeUnitTo(limitMin, FEET, preferredUnit) || 0),
    Math.ceil(changeUnitTo(limitMax, FEET, preferredUnit) || 0),
  ];
};

export const processSpudDateLimits = (spudDateLimits: SpudDateLimits) => {
  const minDate = spudDateLimits.min;
  const maxDate = spudDateLimits.max;

  return [
    isValidDate(minDate) ? startOf(minDate, 'day') : undefined,
    isValidDate(maxDate) ? endOf(maxDate, 'day') : undefined,
  ];
};

export const mapWellsToThreeD = (wells: Well[]) => {
  return wells.map((well) => ({
    ...well,
    metadata: {
      x_coordinate: get(well, 'geometry.coordinates[0]'),
      y_coordinate: get(well, 'geometry.coordinates[1]'),
    },
  }));
};

export const mapWellboresToThreeD = (wells: Well[]) => {
  return ([] as Wellbore[])
    .concat(
      ...wells
        .filter((row) => row.wellbores)
        .map((row) =>
          row.wellbores
            ? row.wellbores.map((wellbore) => ({
                ...wellbore,
                metadata: {
                  ...(wellbore.metadata || {}),
                  // Added these as a temporary fix for 3d component
                  elevation_value_unit: get(row, 'datum.elevation.unit', ''),
                  elevation_value: get(row, 'datum.elevation.value', ''),
                  elevation_type: 'KB',
                  bh_x_coordinate: get(row, 'metadata.x_coordinate', ''),
                  bh_y_coordinate: get(row, 'metadata.y_coordinate', ''),
                },
              }))
            : []
        )
    )
    .map((wellbore) => ({
      ...wellbore,
      parentId: wellbore.wellId,
    }));
};

export const toBooleanMap = (list: (number | string)[], status = true) =>
  list.reduce(
    (booleanMap, key) => ({
      ...booleanMap,
      [key]: status,
    }),
    {}
  );

export const getDummyNptEventForWellbore = (
  wellbore: Wellbore,
  extras?: Partial<NPTEvent>
): NPTEvent => ({
  parentExternalId: '',
  parentType: '',
  sourceEventExternalId: '',
  source: '',
  startTime: 0,
  endTime: 0,
  duration: 0,
  ...extras,
  wellboreId: wellbore.id,
  wellName: wellbore.metadata?.wellName,
  wellboreName: wellbore.description,
});
