import React from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';

import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';

import {
  DEFAULT_TOOLTIP_PLACEMENT,
  TOOLTIP_CONTENT_ELEMENT_STYLES,
} from './constants';
import { TooltipWrapper } from './elements';
import { TooltipProps } from './types';

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  options,
  disabled,
  hideArrow,
  ...config
}) => {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip(
    {
      placement: DEFAULT_TOOLTIP_PLACEMENT,
      ...config,
    },
    options
  );

  const isStringContent = isString(content);
  const backgroundColor = isStringContent
    ? 'var(--cogs-bg-inverted)'
    : 'var(--cogs-bg-default)';
  const borderColor = isStringContent
    ? 'var(--cogs-border-default)'
    : 'transparent';

  return (
    <TooltipWrapper backgroundColor={backgroundColor} borderColor={borderColor}>
      <span ref={setTriggerRef}>{children}</span>

      {!disabled && visible && !isEmpty(content) && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({
            className: 'tooltip-container',
            style: isStringContent ? undefined : TOOLTIP_CONTENT_ELEMENT_STYLES,
          })}
        >
          <span>{content}</span>

          {!hideArrow && (
            <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          )}
        </div>
      )}
    </TooltipWrapper>
  );
};
