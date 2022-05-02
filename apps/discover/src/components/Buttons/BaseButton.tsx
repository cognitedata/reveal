import { Button } from '@cognite/cogs.js';

import { Tooltip } from 'components/Tooltip';

import { DEFAULT_BUTTON_TYPE, DEFAULT_TOOLTIP_PLACEMENT } from './constants';
import { MarginWrapper } from './elements';
import { BaseButtonProps } from './types';

export const BaseButton: React.FC<BaseButtonProps> = ({
  margin = true,
  text,
  tooltip,
  tooltipPlacement = DEFAULT_TOOLTIP_PLACEMENT,
  ...props
}) => {
  const button = () => (
    <Button block type={DEFAULT_BUTTON_TYPE} {...props}>
      {text}
    </Button>
  );

  const wrapInTooltip = (tooltip: string, children: JSX.Element) => (
    <span data-testid="base-button-tooltip-wrapper">
      <Tooltip title={tooltip} placement={tooltipPlacement} enabled={!!tooltip}>
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
