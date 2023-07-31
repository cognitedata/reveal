import { ReactNode } from 'react';

import { ButtonProps, IconType } from '@cognite/cogs.js';

import { TooltipPlacement } from 'components/Tooltip';

export interface BaseButtonProps extends ButtonProps {
  margin?: boolean;
  text?: string;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  hideIcon?: boolean;
  children?: ReactNode;
}

export interface IconButtonProps {
  icon: IconType;
  disabled?: boolean;
  tooltip?: string;
  onClick: () => void;
}

export type ExtendedButtonProps = Omit<BaseButtonProps, 'icon'>;
