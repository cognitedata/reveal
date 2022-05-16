import { ReactNode } from 'react';
import { Config, PopperOptions } from 'react-popper-tooltip';

export interface TooltipProps extends Config {
  content?: string | JSX.Element;
  options?: PopperOptions;
  disabled?: boolean;
  children?: ReactNode;
}
