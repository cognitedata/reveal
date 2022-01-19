import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { getIcon } from '@/UserInterface/Components/Icon/IconSelector';
import { IconTypes } from '@/UserInterface/Components/Icon/IconTypes';
import styled from 'styled-components';

interface ToolbarToolTipProps {
  type?: IconTypes;
  name?: string;
  src?: string;
  tooltip?: {
    text: string;
    placement?: 'bottom' | 'right-start';
  };
  iconSize?: { width: number; height: number };
  children: any;
}

export const ToolbarToolTip: React.FC<ToolbarToolTipProps> = (
  props: ToolbarToolTipProps
) => {
  const { type, name, src, tooltip, iconSize } = props;

  // TODO - Remove getIcon once Settings implementation complete
  const imgSrc = src || (type && name ? getIcon(type, name) : '');
  const style = iconSize
    ? { width: iconSize.width, height: iconSize.height }
    : {};

  const image = imgSrc ? (
    <TooltipImage src={imgSrc} style={style} alt={name} />
  ) : null;

  return tooltip && tooltip.text ? (
    <Tooltip
      placement={tooltip.placement || 'auto'}
      content={
        <ImageTooltip>
          {image}
          <TooltipWrapper>
            {tooltip.text
              .split('\n')
              .map((line, index) =>
                !index ? (
                  <TooltipTitle key={`line-${line}`}>{line}</TooltipTitle>
                ) : (
                  <small key={`line-${line}`}>{line}</small>
                )
              )}
          </TooltipWrapper>
        </ImageTooltip>
      }
    >
      {props.children}
    </Tooltip>
  ) : (
    props.children
  );
};

const ImageTooltip = styled.div`
  display: flex;
  align-items: flex-start;
`;
const TooltipImage = styled.img`
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
`;
const TooltipWrapper = styled.div`
  display: flex;
  align-self: center;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;
const TooltipTitle = styled.p`
  margin: 0;
`;
