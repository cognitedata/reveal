import { ReactNode } from 'react';

import { Icon, Tooltip, TooltipProps } from '@cognite/cogs.js';

import { getContainer, TooltipLink } from '../../utils';

interface InfoTooltipProps {
  tooltipText: string | ReactNode;
  url?: string;
  urlTitle?: string;
  title?: string;
  showIcon: boolean;
  placement?: TooltipProps['position'];
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
      placement={placement || ('top' as any)}
      content={
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
      wrapped
      interactive
      appendTo={getContainer}
    >
      <>
        {title} {children}{' '}
        {showIcon && (
          <Icon
            type="InfoFilled"
            css={{
              marginLeft: '5px',
            }}
          />
        )}
      </>
    </Tooltip>
  );
};

export default InfoTooltip;
