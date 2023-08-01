import React from 'react';

import { Button, ButtonProps, Tooltip } from '@cognite/cogs.js';

type TooltipPositionType =
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom'
  | 'left-bottom'
  | 'left-top'
  | 'left'
  | 'right-bottom'
  | 'right-top'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'top'
  | undefined;

type Props = {
  ariaLabel?: string;
  key?: string;
  tooltipContent?: string;
  tooltipPosition?: TooltipPositionType;
};

export const ToggleButton: React.FC<Props & ButtonProps> = ({
  toggled,
  onClick,
  icon,
  ariaLabel,
  key,
  tooltipContent,
  tooltipPosition,
  ...rest
}) => {
  if (tooltipContent !== undefined) {
    return (
      <Tooltip key={key} content={tooltipContent} position={tooltipPosition}>
        <Button
          icon={icon}
          toggled={toggled}
          aria-label={ariaLabel}
          onClick={onClick}
          {...rest}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      key={key}
      icon={icon}
      toggled={toggled}
      aria-label={ariaLabel}
      onClick={onClick}
      {...rest}
    />
  );
};
