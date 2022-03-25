import React from 'react';
import { TooltipLink } from 'utils/styledComponents';
import { Icon } from '@cognite/cogs.js';
import Tooltip, { TooltipPlacement } from 'antd/lib/tooltip';
import { getContainer } from 'utils/shared';

interface InfoTooltipProps {
  tooltipText: string | React.ReactNode;
  url?: string;
  urlTitle?: string;
  title?: string;
  showIcon: boolean;
  placement?: TooltipPlacement;
  children?: any;
}

const InfoTooltip = ({
  tooltipText,
  url,
  urlTitle,
  title,
  showIcon,
  placement,
  children,
}: InfoTooltipProps) => {
  return (
    <Tooltip
      placement={placement}
      title={
        <p>
          {tooltipText}
          {url && urlTitle && (
            <TooltipLink href={url} target="_blank" rel="noopener noreferrer">
              {' '}
              {urlTitle}
            </TooltipLink>
          )}
        </p>
      }
      getPopupContainer={getContainer}
    >
      {title} {children}{' '}
      {showIcon && (
        <Icon
          type="InfoFilled"
          style={{
            marginLeft: '5px',
          }}
        />
      )}
    </Tooltip>
  );
};

export default InfoTooltip;
