import { ColorConfig } from 'components/charts/types';

export interface LegendProps {
  checkboxState: LegendCheckboxState;
  barColorConfig: ColorConfig;
  onChange: (option: string, checked: boolean) => void;
  title?: string;
  isolateLegend?: boolean;
  floatingHeight?: number;
}

export interface LegendCheckboxState {
  [option: string]: boolean;
}

export interface LegendOptions {
  title?: string;
  accessor?: string;
  isolate?: boolean;
  overlay?: boolean;
}
