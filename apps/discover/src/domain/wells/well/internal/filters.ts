import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import { isNumberTuple } from 'utils/types/isNumberTuple';
import { isStringsArray } from 'utils/types/isStringsArray';

import {
  PropertyFilter,
  Identifier,
  DurationRange,
  DurationUnitEnum,
  DateRange,
  AngleUnitEnum,
  AngleRange,
} from '@cognite/sdk-wells';

// helpers for using the SDK
export const filters = {
  toContainsAny: <T extends string | number>(items?: T[]) => {
    if (isUndefined(items)) return undefined;
    return { containsAny: items };
  },

  toContainsAll: <T extends string | number>(items?: T[]) => {
    if (isUndefined(items)) return undefined;
    return { containsAll: items };
  },

  toIdentifier: (id: number | string): Identifier => {
    return { matchingId: String(id) };
  },

  toPropertyFilter: (
    filter?: string[],
    isSet = true
  ): PropertyFilter | undefined => {
    if (isUndefined(filter)) return undefined;

    return {
      isSet,
      oneOf: filter,
    };
  },

  toRange: <T>(
    doubleRange?: DoubleRange | [number, number],
    unit?: T
  ): { min: number; max: number; unit: T } | undefined => {
    if (unit && isNumberTuple(doubleRange)) {
      return {
        min: doubleRange[0],
        max: doubleRange[1],
        unit,
      };
    }

    return undefined;
  },

  toHourRange: (
    doubleRange?: DoubleRange | [number, number],
    unit: DurationUnitEnum = DurationUnitEnum.Hour
  ): DurationRange | undefined => {
    if (isArray(doubleRange)) {
      return {
        min: doubleRange[0],
        max: doubleRange[1],
        unit,
      };
    }

    return undefined;
  },

  toAngleRange: (
    doubleRange?: DoubleRange | [number, number],
    unit: AngleUnitEnum = AngleUnitEnum.Degree
  ): AngleRange | undefined => {
    if (isArray(doubleRange)) {
      return {
        min: doubleRange[0],
        max: doubleRange[1],
        unit,
      };
    }

    return undefined;
  },

  toDateRange: (
    dateRange?: DateRange | [string, string]
  ): DateRange | undefined => {
    if (isStringsArray(dateRange)) {
      return {
        min: dateRange[0],
        max: dateRange[1],
      };
    }

    if (dateRange?.max || dateRange?.min) {
      return {
        min: dateRange?.min,
        max: dateRange?.max,
      };
    }

    return {};
  },
};
