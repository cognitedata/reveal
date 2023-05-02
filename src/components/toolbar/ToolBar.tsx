import React from 'react';
import styled from 'styled-components';
import { Button, Colors, Divider, Flex, IconType } from '@cognite/cogs.js';
import { TOOLBAR_MARGIN, Z_INDEXES } from 'common/constants';
import { MouseEventHandler } from 'react';

export type ToolbarButtonProps = {
  children?: string | React.ReactNode;
  icon?: IconType;
  iconPlacement?: 'left' | 'right';
  divider?: boolean;
  disabled?: boolean;
  activeButton?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

type ToolbarProps = {
  buttons: ToolbarButtonProps[];
};

const Toolbar = ({ buttons }: ToolbarProps) => {
  return (
    <ToolbarContainer alignItems="center" justifyContent="space-between">
      {buttons.map((button, index) => {
        return (
          <>
            <ToolbarButton
              key={index}
              onClick={(e) => {
                button.onClick(e);
              }}
              active={button.activeButton}
              icon={button.icon}
              iconPlacement={button.iconPlacement}
              size="small"
              disabled={button.disabled}
            >
              {button.children}
            </ToolbarButton>
            {button.divider && <Divider direction="vertical" length="16px" />}
          </>
        );
      })}
    </ToolbarContainer>
  );
};

const ToolbarContainer = styled(Flex)`
  background-color: white;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  width: 160px;
  padding: 2px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: ${TOOLBAR_MARGIN}px;
  right: ${TOOLBAR_MARGIN}px;
  z-index: ${Z_INDEXES.TOOLBAR};
`;

const ToolbarButton = styled(Button)<{ active: boolean | undefined }>`
  background-color: ${({ active }) =>
    active
      ? Colors['surface--interactive--toggled-default']
      : 'white'} !important;
  color: ${({ active }) =>
    active && Colors['text-icon--interactive--default']} !important;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: ${Colors['surface--interactive--hover']} !important;
  }
`;

export default Toolbar;
