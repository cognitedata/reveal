import React from 'react';

import { IconType, OptionType } from '@cognite/cogs.js';

import { ExtraLabels } from '../interfaces';
import { MultiSelectOptionType } from '../MultiSelect/types';

export type Category = string;

export type MultiSelectCategorizedOptionMap = Record<
  Category,
  MultiSelectOptionType[] | undefined
>;

export type OtherOption = {
  label: string;
  value: string;
};

export type PossibleOptionsType =
  | MultiSelectCategorizedOption[]
  | MultiSelectCategorizedOptionMap;

type MultiSelectCategorizedViewMode = 'indent' | 'submenu';

export interface MultiSelectCategorizedProps {
  title: string;
  onValueChange: (
    values: Record<Category, OptionType<MultiSelectOptionType>[] | undefined>
  ) => void;
  iconInsteadText?: IconType;
  options?: PossibleOptionsType;
  selectedOptions?: PossibleOptionsType;
  placeholder?: string;
  enableSelectAll?: boolean;
  selectAllLabel?: string;
  extraLabels?: ExtraLabels;
  width?: number;
  viewMode?: MultiSelectCategorizedViewMode;
  renderCategoryHelpText?: (nptCode: string) => React.ReactNode;
  boldTitle?: boolean;
}

export interface OptionsCategoryProps<ValueType>
  extends CategorizedOptionType<ValueType> {
  selectedOptions?: OptionType<MultiSelectOptionType>[];
  renderCategoryHelpText?: (nptCode: string) => React.ReactNode;
  onValueChange: ({
    category,
    options,
  }: CategorizedOptionType<ValueType>) => void;
  viewMode?: MultiSelectCategorizedViewMode;
}

export interface MultiSelectCategorizedOption {
  category: Category;
  options?: MultiSelectOptionType[];
}

export interface CategorizedOptionType<ValueType> {
  category: string;
  options: OptionType<ValueType>[] | undefined;
}

export type DropdownViewOption = Omit<
  OptionsCategoryProps<MultiSelectOptionType>,
  'onValueChange'
> & {
  onChangeOption: (
    option: OptionType<MultiSelectOptionType>,
    isSelected: boolean
  ) => void;
  onChangeCategory: (isSelected: boolean) => void;
  renderCategoryHelpText?: (nptCode: string) => React.ReactNode;
};
