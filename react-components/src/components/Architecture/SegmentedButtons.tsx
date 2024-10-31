/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, useState, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { SegmentedControl, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getDefaultCommand, getIcon, getTooltipPlacement } from './utilities';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './IconComponentMapper';
import { useOnUpdate } from './useOnUpdate';
import { type PlacementType } from './types';

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
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);
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
      disabled={label === undefined}
      appendTo={document.body}
      placement={getTooltipPlacement(placement)}>
      <SegmentedControl
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
          <SegmentedControl.Button
            key={getKey(child)}
            icon={<IconComponent iconName={getIcon(child)} />}>
            {child.getLabel(t)}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
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
