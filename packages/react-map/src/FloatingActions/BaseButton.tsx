import * as React from 'react';
import { Tooltip, Button, ButtonProps } from '@cognite/cogs.js';

import { MarginWrapper } from './elements';

type ValidPlacements = 'top' | 'right' | 'bottom' | 'left';
export interface BaseButtonProps extends ButtonProps {
  margin?: boolean;
  text?: string;
  tooltip?: string;
  tooltipPlacement?: ValidPlacements;
  hideIcon?: boolean;
}
export const BaseButton: React.FC<React.PropsWithChildren<BaseButtonProps>> = ({
  margin = true,
  text,
  tooltip,
  tooltipPlacement = 'top',
  ...props
}) => {
  const button = () => (
    <Button block type="ghost" {...props}>
      {text}
    </Button>
  );

  const wrapInTooltip = (tooltip: string, children: JSX.Element) => (
    <span data-testid="base-button-tooltip-wrapper">
      <Tooltip content={tooltip} placement={tooltipPlacement}>
        {children}
      </Tooltip>
    </span>
  );

  const wrapInMarginWrapper = (children: JSX.Element) => (
    <MarginWrapper data-testid="base-button-margin-wrapper">
      {children}
    </MarginWrapper>
  );

  // Check if the button should have a tooltip
  const TooltipButton = tooltip ? wrapInTooltip(tooltip, button()) : button();

  // Check if the button also should have a wrapper
  return margin ? wrapInMarginWrapper(TooltipButton) : TooltipButton;
};
