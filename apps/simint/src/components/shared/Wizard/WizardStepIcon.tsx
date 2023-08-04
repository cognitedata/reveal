import type { MouseEventHandler } from 'react';

import classnames from 'classnames';
import styled from 'styled-components/macro';

import type { IconType } from '@cognite/cogs.js';
import { Icon, NotificationDot } from '@cognite/cogs.js';

export interface WizardStepIconProps {
  active: boolean;
  borderWidth: number;
  completed: boolean;
  disabled: boolean;
  icon: IconType;
  iconSize: number;
  labeledBy: string;
  onClick: MouseEventHandler<HTMLElement>;
  validationErrorCount?: number;
}

export function WizardStepIcon({
  active,
  borderWidth,
  completed,
  disabled,
  icon,
  iconSize,
  labeledBy,
  onClick,
  validationErrorCount = 0,
}: WizardStepIconProps) {
  return (
    <WizardStepIconContainer
      borderWidth={borderWidth}
      className={classnames({ completed, active, disabled })}
      iconSize={iconSize}
    >
      <NotificationDot
        hidden={!validationErrorCount}
        value={validationErrorCount.toString()}
      >
        <button aria-labelledby={labeledBy} type="button" onClick={onClick}>
          <Icon type={icon} />
        </button>
      </NotificationDot>
    </WizardStepIconContainer>
  );
}

export const WizardStepIconContainer = styled.div<{
  iconSize: number;
  borderWidth: number;
}>`
  display: flex;
  align-items: center;
  position: relative;
  button {
    border: 0;
    background: transparent;
    margin: 0;
    padding: 0;
    outline: 0 !important;
  }
  &:first-child {
    flex: 1 0 0;
    &::before {
      content: '';
      display: block;
      flex: 1 1 auto;
    }
  }
  &:not(:first-child) {
    flex: 1 0 0;
    &::before {
      transition: background-position 0.2s ease-out;
      background-image: linear-gradient(
        to right,
        var(--cogs-primary) 0%,
        var(--cogs-primary) 50%,
        var(--cogs-border-default) 50%,
        var(--cogs-border-default) 100%
      );
      background-size: 205%;
      background-position: 100% 0;
      flex: 1 0 auto;
      content: '';
      display: block;
      height: ${(props) => props.borderWidth}px;
    }
  }
  .cogs-icon {
    width: auto !important;
    svg {
      width: ${(props) => props.iconSize / 2}px;
    }
    transition: box-shadow 0.5s ease-out, color 0.3s ease-out;
    padding: ${(props) => props.iconSize / 4}px;
    box-shadow: inset 0 0 0 ${(props) => props.borderWidth}px
      var(--cogs-border-default);
    background: var(--cogs-white);
    color: var(--cogs-border-default);
    display: block;
    line-height: 1;
    cursor: pointer;
    border: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &.active {
    .cogs-icon {
      color: var(--cogs-white);
      box-shadow: inset 0 0 0 50px var(--cogs-primary);
    }
    &::before {
      background-position: 0 0;
    }
  }
  &.completed {
    .cogs-icon {
      color: var(--cogs-text-default);
      box-shadow: inset 0 0 0 ${(props) => props.borderWidth}px
        var(--cogs-primary);
    }
    &::before {
      background-position: 0 0;
    }
  }
  &.disabled {
    &.active {
      .cogs-icon {
        opacity: 1;
        background: var(--cogs-border-default);
        color: var(--cogs-white);
        box-shadow: inset 0 0 0 ${(props) => props.borderWidth}px
          var(--cogs-primary);
      }
      &::before {
        background-position: 0 0;
      }
    }
    &.completed {
      .cogs-icon {
        opacity: 1;
        color: var(--cogs-border-default);
      }
    }
  }
`;
