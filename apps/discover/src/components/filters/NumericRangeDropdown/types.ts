import { LabelVariants } from '@cognite/cogs.js';

export interface NumericRangeDropdownConfig {
  width?: number;
  variant?: LabelVariants;
}

export interface RangeSelectProps {
  range: number[];
  selectedRange: number[];
  onChange: (selectedRange: number[]) => void;
  width: number;
}

export interface NumberInputProps {
  range: number[];
  value: number;
  onChange: (value: number) => void;
}
