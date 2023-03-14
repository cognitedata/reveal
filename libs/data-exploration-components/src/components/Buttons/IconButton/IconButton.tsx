import { Button, ButtonProps, Tooltip } from '@cognite/cogs.js';
import React from 'react';

type Props = ButtonProps & {
  tooltipContent: string;
};
export const IconButton: React.FC<Props> = ({
  icon,
  tooltipContent,
  onClick,
  ...extra
}) => {
  return (
    <Tooltip position="bottom" content={tooltipContent}>
      <Button icon={icon} onClick={onClick} {...extra} />
    </Tooltip>
  );
};
