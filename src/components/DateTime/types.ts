import { relativeTimeOptions } from './constants';

export type RelativeTimeOption =
  | typeof relativeTimeOptions[number]['label']
  | '';

export type TimePeriodProps = {
  onPeriodChange: (period: RelativeTimeOption) => void;
  optionSelected: RelativeTimeOption;
};
