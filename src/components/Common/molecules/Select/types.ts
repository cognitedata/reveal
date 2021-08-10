import { SelectProps } from '@cognite/cogs.js';

export type TooltipProps = {
  tooltipContent?: string;
  hasPermission?: boolean;
  isLoaded?: boolean;
};

export type CustomSelectProps = {
  selectProps: SelectProps<any>;
  tooltipProps?: TooltipProps;
};
