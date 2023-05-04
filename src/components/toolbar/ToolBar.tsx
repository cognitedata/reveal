import React from 'react';
import styled from 'styled-components';
import { Button, Colors, Divider, Flex, IconType } from '@cognite/cogs.js';
import {
  TOOLBAR_IS_HISTORY_VISIBLE_WIDTH,
  TOOLBAR_MARGIN,
  Z_INDEXES,
} from 'common/constants';
import { MouseEventHandler } from 'react';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

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
  const { isHistoryVisible } = useWorkflowBuilderContext();

  return (
    <ToolbarContainer
      alignItems="center"
      justifyContent="space-between"
      className={isHistoryVisible ? 'toolbar-history-visible' : ''}
      $isHistoryVisible={isHistoryVisible}
    >
      {buttons.map((button, index) => {
        return (
          <>
            <ToolbarButton
              key={index}
              onClick={(e) => {
                button.onClick(e);
              }}
              toggled={button.activeButton}
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

const ToolbarContainer = styled(Flex)<{ $isHistoryVisible: boolean }>`
  background-color: white;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  width: 160px;
  padding: 2px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: ${TOOLBAR_MARGIN}px;
  right: ${({ $isHistoryVisible }) =>
    $isHistoryVisible ? TOOLBAR_IS_HISTORY_VISIBLE_WIDTH : TOOLBAR_MARGIN}px;
  z-index: ${Z_INDEXES.TOOLBAR};
`;

const ToolbarButton = styled(Button)`
  background-color: ${(props) => (props.toggled ? '' : 'white')} !important;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: ${Colors['surface--interactive--hover']} !important;
  }
`;

export default Toolbar;
