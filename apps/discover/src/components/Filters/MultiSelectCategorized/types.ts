import { OptionType } from '@cognite/cogs.js';

import { ExtraLabels } from '../interfaces';
import { MultiSelectOptionType } from '../MultiSelect/types';

export type Category = string;

export type MultiSelectCategorizedOptionMap = Record<
  Category,
  MultiSelectOptionType[] | undefined
>;

export type PossibleOptionsType =
  | MultiSelectCategorizedOption[]
  | MultiSelectCategorizedOptionMap;

export interface MultiSelectCategorizedProps {
  title: string;
  onValueChange: (
    values: Record<Category, OptionType<MultiSelectOptionType>[] | undefined>
  ) => void;
  options?: PossibleOptionsType;
  selectedOptions?: PossibleOptionsType;
  placeholder?: string;
  enableSelectAll?: boolean;
  selectAllLabel?: string;
  extraLabels?: ExtraLabels;
  width?: number;
}

export interface OptionsCategoryProps<ValueType>
  extends CategorizedOptionType<ValueType> {
  selectedOptions?: OptionType<MultiSelectOptionType>[];
  onValueChange: ({
    category,
    options,
  }: CategorizedOptionType<ValueType>) => void;
}

export interface MultiSelectCategorizedOption {
  category: Category;
  options?: MultiSelectOptionType[];
}

export interface CategorizedOptionType<ValueType> {
  category: string;
  options: OptionType<ValueType>[] | undefined;
}
