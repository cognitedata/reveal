import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import { toBooleanMap } from 'utils/booleanMap';

import { OptionType } from '@cognite/cogs.js';

import { ExtraLabels } from '../interfaces';
import {
  MultiSelectOptionObject,
  MultiSelectOptionType,
  MultiSelectOptionValue,
} from '../MultiSelect/types';

import {
  MultiSelectCategorizedOption,
  CategorizedOptionType,
  PossibleOptionsType,
  MultiSelectCategorizedOptionMap,
} from './types';
import { EMPTY_SUBMENU_OPTIONS } from './views/DropdownMenuOptions';

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
          const checkboxColor = get(option, 'checkboxColor');

          return {
            label,
            value,
            helpText,
            checkboxColor,
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

export const selectionMap = (
  selectedOptions: OptionType<MultiSelectOptionType>[] | undefined
) =>
  toBooleanMap(
    (selectedOptions || []).map((option) => {
      if (typeof option === 'string') {
        return option;
      }

      if (option?.value && typeof option?.value === 'string') {
        return option.value;
      }

      return option.label;
    })
  );

export const adaptToMultiSelectCategorizedOptionMap = <T>(
  data: T[],
  accessors: {
    category: DeepKeyOf<T>;
    options: DeepKeyOf<T>;
    checkboxColor?: DeepKeyOf<T>;
  }
) => {
  const groupedData = groupBy(data, accessors.category);

  return Object.keys(groupedData).reduce((optionsMap, category) => {
    const categoryOptions: MultiSelectOptionObject[] = uniqBy(
      groupedData[category],
      accessors.options
    ).map((dataElement) => ({
      value: get(dataElement, accessors.options) || EMPTY_SUBMENU_OPTIONS,
      checkboxColor: accessors.checkboxColor
        ? get(dataElement, accessors.checkboxColor)
        : undefined,
    }));

    return {
      ...optionsMap,
      [category]: categoryOptions,
    };
  }, {} as MultiSelectCategorizedOptionMap);
};
