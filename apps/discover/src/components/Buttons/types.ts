import { ButtonProps } from '@cognite/cogs.js';

import { TooltipPlacement } from 'components/Tooltip';

export interface BaseButtonProps extends ButtonProps {
  margin?: boolean;
  text?: string;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  hideIcon?: boolean;
}

export type ExtendedButtonProps = Omit<BaseButtonProps, 'icon'>;
