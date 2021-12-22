import Tabs from 'rc-tabs';
import styled from 'styled-components/macro';

import type { WizardStepProps } from './WizardStep';
import { WizardStep } from './WizardStep';
import { WizardStepIcon } from './WizardStepIcon';

import type { TabsProps } from 'rc-tabs';

type WizardStepElement = React.ReactElement<WizardStepProps, typeof WizardStep>;

interface WizardProps extends TabsProps {
  iconSize?: number;
  borderWidth?: number;
  children: WizardStepElement[];
}

export function Wizard({
  iconSize = 48,
  borderWidth = 3,
  children,
  ...additionalProps
}: WizardProps) {
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
        {panes.map(({ key, props: { icon, disabled = false } }, index) => {
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
              onClick={(event) => {
                onTabClick?.((key ?? 'unknown').toString(), event);
              }}
            />
          );
        })}
        <div className="filler" role="none" />
      </WizardStepIcons>
      <WizardStepLabels>
        {panes.map(({ key, props: { title } }) => (
          <span id={`${key ?? 'unknown'}-label`} key={key}>
            {title}
          </span>
        ))}
      </WizardStepLabels>
    </WizardProgressContainer>
  );

  return (
    <Tabs renderTabBar={renderTabBar} {...additionalProps}>
      {children}
    </Tabs>
  );
}

Wizard.Step = WizardStep;

const WizardProgressContainer = styled.div``;

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
  margin: 12px 0 24px 0;
  span {
    padding: 0 12px;
    flex: 1 1 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
`;
