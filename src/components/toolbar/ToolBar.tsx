import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Colors,
  Divider,
  Flex,
  IconType,
  Tooltip,
} from '@cognite/cogs.js';
import { TOOLBAR_MARGIN, Z_INDEXES } from 'common/constants';
import { MouseEventHandler } from 'react';

export type ToolbarButtonProps = {
  children?: string | React.ReactNode;
  icon?: IconType;
  iconPlacement?: 'left' | 'right';
  divider?: boolean;
  disabled?: boolean;
  activeButton?: boolean;
  plusButton?: boolean;
  dividerDirection?: 'horizontal' | 'vertical';
  tooltipContent?: string;
  showTooltip?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type ToolbarProps = {
  buttons: ToolbarButtonProps[];
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  toolbarDirection: 'row' | 'column';
  gap?: number;
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
};

const Toolbar = ({
  buttons,
  placement,
  toolbarDirection,
  gap,
  tooltipPlacement,
}: ToolbarProps) => {
  const [toolbarPlacement, setToolbarPlacement] = useState<Object>({
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
  });

  useEffect(() => {
    switch (placement) {
      case 'topLeft':
        setToolbarPlacement({
          top: TOOLBAR_MARGIN,
          left: TOOLBAR_MARGIN,
        });
        break;
      case 'topRight':
        setToolbarPlacement({
          top: TOOLBAR_MARGIN,
          right: TOOLBAR_MARGIN,
        });
        break;
      case 'bottomLeft':
        setToolbarPlacement({
          bottom: TOOLBAR_MARGIN,
          left: TOOLBAR_MARGIN,
        });
        break;
      case 'bottomRight':
        setToolbarPlacement({
          bottom: TOOLBAR_MARGIN,
          right: TOOLBAR_MARGIN,
        });
        break;
      default:
        break;
    }
  }, [placement]);

  return (
    <ToolbarContainer
      alignItems="center"
      justifyContent="space-between"
      direction={toolbarDirection}
      gap={gap}
      $placement={toolbarPlacement}
    >
      {buttons.map((button, index) => {
        return (
          <>
            <Tooltip
              content={button.tooltipContent}
              elevated
              delay={300}
              disabled={!button.showTooltip}
              position={tooltipPlacement}
            >
              <ToolbarButton
                key={index}
                onClick={(e) => {
                  button.onClick && button.onClick(e);
                }}
                toggled={button.activeButton}
                plusButton={button.plusButton}
                icon={button.icon}
                iconPlacement={button.iconPlacement}
                size="small"
                disabled={button.disabled}
              >
                {button.children}
              </ToolbarButton>
            </Tooltip>
            {button.divider && (
              <Divider direction={button.dividerDirection} length="16px" />
            )}
          </>
        );
      })}
    </ToolbarContainer>
  );
};

const ToolbarContainer = styled(Flex)<{
  $placement: {
    top?: number | undefined;
    right?: number | undefined;
    bottom?: number | undefined;
    left?: number | undefined;
  };
}>`
  background-color: white;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  width: fit-content;
  padding: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  ${(props) =>
    props.$placement.top !== undefined
      ? `top: ${props.$placement.top}px;`
      : ''};
  ${(props) =>
    props.$placement.right !== undefined
      ? `right: ${props.$placement.right}px;`
      : ''};
  ${(props) =>
    props.$placement.bottom !== undefined
      ? `bottom: ${props.$placement.bottom}px;`
      : ''};
  ${(props) =>
    props.$placement.left !== undefined
      ? `left: ${props.$placement.left}px;`
      : ''};
  z-index: ${Z_INDEXES.TOOLBAR};
`;

interface BackgroundColorProps {
  active?: boolean | undefined;
  plusButton?: boolean | undefined;
}

const getBackgroundColor = ({ active, plusButton }: BackgroundColorProps) => {
  if (plusButton) {
    return Colors['surface--action--strong--default'];
  } else if (active) {
    return '';
  } else {
    return 'white';
  }
};

const getColor = ({ plusButton }: BackgroundColorProps) => {
  if (plusButton) {
    return 'white';
  }
};

const onHover = ({ plusButton }: BackgroundColorProps) => {
  if (plusButton) {
    return Colors['surface--action--strong--hover'];
  } else {
    return Colors['surface--interactive--hover'];
  }
};

const ToolbarButton = styled(Button)<BackgroundColorProps>`
  background-color: ${({ toggled, plusButton }) =>
    getBackgroundColor({ active: toggled, plusButton })} !important;
  color: ${({ plusButton }) => getColor({ plusButton })} !important;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background-color: ${({ plusButton }) => onHover({ plusButton })} !important;
  }
`;

export default Toolbar;
