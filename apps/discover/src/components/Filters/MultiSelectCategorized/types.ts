import { OptionType } from '@cognite/cogs.js';

import { ExtraLabels } from '../interfaces';
import { MultiSelectOptionType } from '../MultiSelect/types';

export type Category = string;

export interface MultiSelectCategorizedProps {
  title: string;
  onValueChange: (
    values: Record<Category, OptionType<MultiSelectOptionType>[] | undefined>
  ) => void;
  options?: MultiSelectCategorizedOption[];
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
  options: MultiSelectOptionType[] | undefined;
}

export interface CategorizedOptionType<ValueType> {
  category: string;
  options: OptionType<ValueType>[] | undefined;
}
