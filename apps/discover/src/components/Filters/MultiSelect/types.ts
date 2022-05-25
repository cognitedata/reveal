import { SelectProps } from '@cognite/cogs.js';

import { ExtraLabels } from '../interfaces';

export interface MultiSelectProps
  extends Omit<SelectProps<MultiSelectOptionType>, 'value' | 'options'> {
  options?: MultiSelectOptionType[];
  selectedOptions?: MultiSelectOptionValue[];
  onValueChange: (values: string[]) => void;
  isTextCapitalized?: boolean;
  isOptionsSorted?: boolean;
  titlePlacement?: TitlePlacement;
  displayValue?: string;
  hideClearIndicator?: boolean;
  extraLabels?: ExtraLabels;
  footer?: () => React.ReactElement;
}

export interface MultiSelectGroupProps
  extends Omit<MultiSelectProps, 'options'> {
  groupedOptions?: { label: string; options: MultiSelectOptionType[] }[];
}

export type MultiSelectOptionValue = string | number;

export type MultiSelectOptionObject = {
  value: MultiSelectOptionValue;
  count?: number;
  helpText?: string | JSX.Element;
};

export type MultiSelectOptionType =
  | MultiSelectOptionValue
  | MultiSelectOptionObject;

export interface MultiSelectContainerProps {
  outlined?: boolean;
  hideClearIndicator?: boolean;
}

export type TitlePlacement = 'default' | 'top';
