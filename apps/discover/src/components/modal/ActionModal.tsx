import React, { Fragment } from 'react';

import styled from 'styled-components/macro';

import { Button, Tooltip, IconType } from '@cognite/cogs.js';

import { BlankModal } from './BlankModal';
import { Props } from './Modal';

const ActionWrapper = styled.div`
  margin-right: 10px;
`;

// Quick hack to add actions to the top part of the modal
const ActionsContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 65px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
`;

// Quick hack to add text to the top part of the modal
const TextAction = styled.div`
  text-align: center;
  display: inline-block;
  line-height: 36px;
  height: 36px;
  margin-right: 10px;
  position: relative;
  bottom: 3px;
`;

interface Action {
  title: string;
  text?: string;
  onClick?: () => void;
  icon?: IconType;
  disabled?: boolean;
}

export interface ActionModalProps extends Props {
  actions?: Action[];
}
/*
 * Action modal is a modal that has a topbar with actions
 */
export const ActionModal: React.FC<ActionModalProps> = ({
  children,
  actions,
  ...rest
}) => {
  return (
    <BlankModal {...rest}>
      <>
        <ActionsContainer>
          {(actions || []).map((action) => (
            <Fragment key={`${action.text}${action.icon}`}>
              {action.icon && (
                <ActionWrapper>
                  <Tooltip content={action.title} placement="bottom">
                    <Button
                      icon={action.icon}
                      onClick={action.onClick}
                      type="ghost"
                      disabled={action.disabled}
                      aria-label={action.text}
                      data-testid={`button-${action.text}`}
                    />
                  </Tooltip>
                </ActionWrapper>
              )}
              {action.text && <TextAction>{action.text}</TextAction>}
            </Fragment>
          ))}
        </ActionsContainer>
        {children}
      </>
    </BlankModal>
  );
};
