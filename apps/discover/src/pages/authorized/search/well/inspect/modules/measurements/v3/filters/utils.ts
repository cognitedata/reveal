import isEmpty from 'lodash/isEmpty';

import { OptionType } from '@cognite/cogs.js';
import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { PressureUnit, DepthMeasurementUnit } from 'constants/units';

export const mapCurvesToOptions = (
  curves: DepthMeasurementColumn[]
): OptionType<DepthMeasurementColumn>[] =>
  curves.map((column) => ({ value: column, label: column.columnExternalId }));

export const mapStringCurvesToOptions = (
  curves: string[]
): OptionType<string>[] =>
  curves.map((curve) => ({ value: curve, label: curve }));

export const mapCollectionToOptions = <
  T extends PressureUnit | DepthMeasurementUnit
>(
  curves: T[]
): OptionType<T>[] => curves.map((curve) => ({ value: curve, label: curve }));

export const mapOptionsToCurves = (options: OptionType<string>[]) =>
  ((options.length && options[0].options) || options)
    .map((option) => option.value)
    .filter((value) => !!value) as string[];

/**
 * Select2 usually returns an array of options but when ALL is selected it returns a single option ( array with one option)
 * which contains all provided options under `options` property. This function is to generalize these two scenarios
 * Ticket is raised to fix this from cogs side PP-2675
 */
export const extractSelectedCurvesFromOptions = <T>(
  options: OptionType<T>[],
  selectedOptions: OptionType<T>[]
) => {
  return (
    (isEmpty(selectedOptions) &&
    !isEmpty(options) &&
    !isEmpty(options[0].options)
      ? options[0].options
      : options) || []
  );
};
