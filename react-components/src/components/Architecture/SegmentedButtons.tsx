import { getTooltipPlacement } from './utilities';
import { IconComponent } from './Factories/IconFactory';
import { LabelWithShortcut } from './LabelWithShortcut';
import { SegmentedControl, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { TOOLTIP_DELAY } from './constants';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { type PlacementType } from './types';
import { type ReactElement } from 'react';
import { useCommand } from './useCommand';
import { useCommandProperty } from './useCommandProperty';
import { useCommandProps } from './useCommandProps';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';

export const SegmentedButtons = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseOptionCommand;
  placement: PlacementType;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const command = useCommand(inputCommand);
  const { uniqueId, isVisible, isEnabled } = useCommandProps(command);
  const selected = useCommandProperty(command, () => getSelectedKey(command));

  if (!isVisible || command.children === undefined) {
    return <></>;
  }
  const label = command.label;

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
      enterDelay={TOOLTIP_DELAY}
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
            icon={<IconComponent iconName={child.icon} />}
            disabled={!isEnabled}
            aria-label={child.label}>
            {child.label}
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
