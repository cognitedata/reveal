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
