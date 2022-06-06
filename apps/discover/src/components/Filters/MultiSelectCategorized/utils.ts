import get from 'lodash/get';
import isArray from 'lodash/isArray';

import { ExtraLabels } from '../interfaces';
import {
  MultiSelectOptionType,
  MultiSelectOptionValue,
} from '../MultiSelect/types';

import {
  MultiSelectCategorizedOption,
  CategorizedOptionType,
  PossibleOptionsType,
} from './types';

export const getProcessedOptions = (
  options: MultiSelectCategorizedOption[],
  extraLabels: ExtraLabels
): CategorizedOptionType<MultiSelectOptionType>[] => {
  const processedOptions = options.map(
    ({ category, options }: MultiSelectCategorizedOption) => {
      return {
        category,
        options: (options || []).map((option) => {
          const value = getValueFromOption(option);
          const label = [value, extraLabels[value]].filter(Boolean).join(' ');
          const helpText = get(option, 'helpText');

          return {
            label,
            value: option,
            helpText,
          };
        }),
      };
    }
  );

  return processedOptions;
};

export const getValueFromOption = (
  option?: MultiSelectOptionType
): MultiSelectOptionValue => {
  return get(option, 'value', option);
};

export const adaptToMultiSelectCategorizedOptions = (
  categoryOptionsMap: Record<string, MultiSelectOptionType[] | undefined> = {}
): MultiSelectCategorizedOption[] => {
  return Object.entries(categoryOptionsMap).map(([category, options]) => ({
    category,
    options,
  }));
};

export const getMultiSelectCategorizedOptions = (
  options?: PossibleOptionsType
): MultiSelectCategorizedOption[] => {
  if (isArray(options)) {
    return options;
  }
  return adaptToMultiSelectCategorizedOptions(options);
};
