import type { LabelVariants, OptionType } from '@cognite/cogs.js';

export const StatusColors: Record<string, LabelVariants> = {
  unknown: 'normal',
  ready: 'normal',
  running: 'warning',
  success: 'success',
  failure: 'danger',
};
export interface OptionGroupValues {
  key: string;
  value: string;
}

export interface FilterOptionsProps {
  modelName: OptionType<OptionGroupValues> | OptionType<OptionGroupValues>[];
  calculationRunType:
    | OptionType<OptionGroupValues>
    | OptionType<OptionGroupValues>[];
  calculationType:
    | OptionType<OptionGroupValues>
    | OptionType<OptionGroupValues>[];
  calculationRunStatus:
    | OptionType<OptionGroupValues>
    | OptionType<OptionGroupValues>[];
}
