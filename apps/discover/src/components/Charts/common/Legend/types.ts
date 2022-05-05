import { ColorConfig } from 'components/Charts/types';

export interface LegendProps {
  legendCheckboxState: LegendCheckboxState;
  colorConfig?: ColorConfig;
  onChangeLegendCheckbox: (option: string, checked: boolean) => void;
  isolateLegend?: boolean;
  legendOptions?: LegendOptions;
  getInfoIcon?: (option: string) => JSX.Element;
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
