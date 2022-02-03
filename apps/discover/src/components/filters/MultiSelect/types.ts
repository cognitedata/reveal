import { PossibleDateRangeDate } from 'utils/date';

import { SelectProps } from '@cognite/cogs.js';

export interface MultiSelectProps
  extends Omit<SelectProps<MultiSelectOptionType>, 'value' | 'options'> {
  options: MultiSelectOptionType[];
  selectedOptions?: MultiSelectOptionValue[];
  onValueChange: (values: string[]) => void;
  isTextCapitalized?: boolean;
  isOptionsSorted?: boolean;
  titlePlacement?: TitlePlacement;
  displayValue?: string;
  hideClearIndicator?: boolean;
  footer?: () => React.ReactElement;
}

export type MultiSelectOptionValue = string | number | PossibleDateRangeDate;

export type MultiSelectOptionObject = {
  value: MultiSelectOptionValue;
  count?: number;
};

export type MultiSelectOptionType =
  | MultiSelectOptionValue
  | MultiSelectOptionObject;

export interface MultiSelectContainerProps {
  outlined?: boolean;
  hideClearIndicator?: boolean;
}

export type TitlePlacement = 'default' | 'top';
