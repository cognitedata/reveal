import { useState } from 'react';

import classNames from 'classnames';
import Tabs from 'rc-tabs';
import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import type { WizardStepProps } from './WizardStep';
import { WizardStep } from './WizardStep';
import { WizardStepIcon } from './WizardStepIcon';

import type { TabsProps } from 'rc-tabs';

type WizardStepElement = React.ReactElement<WizardStepProps, typeof WizardStep>;

interface WizardProps extends TabsProps {
  iconSize?: number;
  borderWidth?: number;
  children: WizardStepElement[];
  onChangeStep?: (currentStep: string, nextStep: string) => boolean;
  onCancel?: () => void;
  onSubmit?: () => Promise<boolean>;
  isValid?: boolean;
  isSubmitting?: boolean;
}

export function Wizard({
  iconSize = 48,
  borderWidth = 3,
  children,
  onChangeStep,
  onCancel,
  onSubmit,
  isValid = true,
  isSubmitting = false,
  ...additionalProps
}: WizardProps) {
  const stepKeys = children.reduce<string[]>(
    (keys, { key, props: { disabled } }) =>
      key && !disabled ? [...keys, key.toString()] : keys,
    []
  );
  const [activeKey, setActiveKey] = useState<string>(stepKeys[0]);

  if (!children.length) {
    return null;
  }

  const renderTabBar = ({
    activeKey,
    onTabClick,
    panes,
  }: TabsProps & {
    panes: WizardStepElement[];
  }) => (
    <WizardProgressContainer>
      <WizardStepIcons iconSize={iconSize} steps={panes.length}>
        {panes.map(
          (
            { key, props: { icon, disabled = false, validationErrors } },
            index
          ) => {
            const isCompleted =
              panes.findIndex(({ key }) => key === activeKey) > index;
            return (
              <WizardStepIcon
                active={key === activeKey}
                borderWidth={borderWidth}
                completed={isCompleted}
                disabled={disabled}
                icon={icon ?? 'DotLarge'}
                iconSize={iconSize}
                key={key}
                labeledBy={`${key ?? 'unknown'}-label`}
                validationErrorCount={validationErrors?.() ?? 0}
                onClick={(event) => {
                  if (disabled) {
                    return;
                  }
                  onTabClick?.((key ?? 'unknown').toString(), event);
                }}
              />
            );
          }
        )}
        <div className="filler" role="none" />
      </WizardStepIcons>
      <WizardStepLabels>
        {panes.map(({ key, props: { title, disabled = false } }) => (
          <span
            className={classNames({ active: key === activeKey, disabled })}
            id={`${key ?? 'unknown'}-label`}
            key={key}
          >
            {title}
          </span>
        ))}
      </WizardStepLabels>
    </WizardProgressContainer>
  );

  const stepKeyIndex = stepKeys.findIndex((stepKey) => stepKey === activeKey);
  const previousKey = stepKeyIndex === 0 ? undefined : stepKeyIndex - 1;
  const nextKey =
    stepKeyIndex === stepKeys.length - 1 ? undefined : stepKeyIndex + 1;
  const setStep = (key: string) => {
    if (onChangeStep) {
      const shouldAllowChange = onChangeStep(activeKey, key);
      if (!shouldAllowChange) {
        return;
      }
    }
    setActiveKey(key);
  };

  return (
    <WizardContainer>
      <Tabs
        activeKey={activeKey}
        renderTabBar={renderTabBar}
        onChange={setStep}
        {...additionalProps}
      >
        {children}
      </Tabs>

      <WizardNavigation>
        <div className="return">
          {onCancel ? (
            <Button
              className="cancel"
              disabled={isSubmitting}
              type="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
        <div className="navigation">
          {previousKey !== undefined ? (
            <Button
              disabled={isSubmitting}
              type="ghost"
              onClick={() => {
                setStep(stepKeys[previousKey]);
              }}
            >
              Previous
            </Button>
          ) : null}
          {nextKey !== undefined ? (
            <Button
              type="primary"
              onClick={() => {
                setStep(stepKeys[nextKey]);
              }}
            >
              Next step
            </Button>
          ) : (
            <Button
              disabled={!isValid}
              loading={isSubmitting}
              type="primary"
              onClick={onSubmit}
            >
              Finish
            </Button>
          )}
        </div>
      </WizardNavigation>
    </WizardContainer>
  );
}

Wizard.Step = WizardStep;

const WizardContainer = styled.div`
  margin: 12px 0;
  display: flex;
  flex-flow: column nowrap;

  .rc-tabs {
    overflow: visible;
    flex: 1 1 auto;
    display: flex;
    flex-flow: column nowrap;
    padding: 9.5rem 0 1.5rem;
  }
  .rt-tabs-tabpane {
    flex: 1 1 auto;
  }
`;

const WizardProgressContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  transform: translate(0, 0); // resets position:fixed (x,y) origin
  width: calc(100% - 3rem);
  position: fixed;
  z-index: 4;
  top: 8.75rem;
  padding-bottom: 1rem;
`;

const WizardStepIcons = styled.div<{ steps: number; iconSize: number }>`
  display: flex;
  justify-content: center;
  position: relative;
  left: calc(
    -${(props) => 100 / props.steps / 2}% + ${(props) => props.iconSize / 2}px
  );
`;

const WizardStepLabels = styled.div`
  display: flex;
  margin: 12px 0 0 0;
  span {
    margin: 0 12px;
    flex: 1 1 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    color: var(--cogs-text-color-secondary);
    &.active {
      font-weight: bold;
      color: var(--cogs-black);
    }
    &.disabled {
      color: var(--cogs-border-default);
      &::after {
        content: ' (n/a)';
      }
    }
  }
`;

const WizardNavigation = styled.div`
  padding-top: 12px;
  border-top: 1px solid var(--cogs-border-default);
  display: flex;
  column-gap: 12px;
  .return {
    flex: 1 1 auto;
  }
  .navigation {
    display: flex;
    column-gap: 12px;
  }
`;
