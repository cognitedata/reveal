import { OptionType } from '@cognite/cogs.js';

export const mapCurvesToOptions = (curves: string[]): OptionType<string>[] =>
  curves.map((curve) => ({ value: curve, label: curve }));

export const mapOptionsToCurves = (options: OptionType<string>[]) =>
  ((options.length && options[0].options) || options)
    .map((option) => option.value)
    .filter((value) => !!value) as string[];
