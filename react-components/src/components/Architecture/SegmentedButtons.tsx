/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, useState, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { SegmentedControl, Tooltip as CogsTooltip, Flex } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getDefaultCommand, getTooltipPlacement } from './utilities';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './Factories/IconFactory';
import { useOnUpdate } from './useOnUpdate';
import { type PlacementType } from './types';
import { TOOLTIP_DELAY } from './constants';
import styled from 'styled-components';

export const SegmentedButtons = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseOptionCommand;
  placement: PlacementType;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseOptionCommand>(
    () => getDefaultCommand(inputCommand, renderTarget),
    []
  );

  // @update-ui-component-pattern
  const [isEnabled, setEnabled] = useState(command.isEnabled);
  const [isVisible, setVisible] = useState(command.isVisible);
  const [uniqueId, setUniqueId] = useState(command.uniqueId);
  const [selected, setSelected] = useState(getSelectedKey(command));

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    if (command instanceof BaseOptionCommand) {
      setSelected(getSelectedKey(command));
    }
  });
  // @end

  if (!isVisible || command.children === undefined) {
    return <></>;
  }
  const label = command.getLabel(t);

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined || label === ''}
      enterDelay={TOOLTIP_DELAY}
      placement={getTooltipPlacement(placement)}>
      <StyledSegmentedControl
        key={uniqueId}
        disabled={!isEnabled}
        currentKey={selected}
        fullWidth
        onButtonClicked={(selectedKey: string) => {
          if (command.children === undefined) {
            return;
          }
          for (const child of command.children) {
            if (getKey(child) === selectedKey) {
              child.invoke();
              renderTarget.domElement.focus();
              break;
            }
          }
        }}>
        {command.children.map((child) => (
          <StyledSegmentedButton key={getKey(child)} icon={<IconComponent iconName={child.icon} />}>
            {child.getLabel(t)}
          </StyledSegmentedButton>
        ))}
      </StyledSegmentedControl>
    </CogsTooltip>
  );
};

// Note: It should use number, but it didn't work.

function getSelectedKey(command: BaseOptionCommand): string {
  const child = command.selectedChild;
  if (child === undefined) {
    return 'undefined';
  }
  return getKey(child);
}

function getKey(command: BaseCommand): string {
  return command.uniqueId.toString();
}

const StyledSegmentedControl = styled(SegmentedControl<string>)`
  display: flex;
  flex: 1;
  padding: var(--space-2, 2px);
  align-items: center;
  gap: var(--space-2, 2px);
  align-self: stretch;
`;

const StyledSegmentedButton = styled(SegmentedControl.Button)`
  display: flex;
  height: var(--button-height, 32px);
  padding: 0px var(--button-padding, 12px);
  justify-content: center;
  align-items: center;
  gap: var(--space-6, 6px);
  flex: 1 0 0;
`;
