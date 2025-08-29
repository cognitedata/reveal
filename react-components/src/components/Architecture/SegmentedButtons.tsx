import { getTooltipPlacement } from './utilities';
import { IconComponent } from './Factories/IconFactory';
import { LabelWithShortcut } from './LabelWithShortcut';
import { SegmentedControl, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { TOOLTIP_DELAY } from './constants';
import { BaseOptionCommand, OptionType } from '../../architecture/base/commands/BaseOptionCommand';
import { type PlacementType } from './types';
import { type ReactElement } from 'react';
import { useCommand } from './hooks/useCommand';
import { useCommandProperty } from './hooks/useCommandProperty';
import { useCommandProps } from './hooks/useCommandProps';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type UniqueId } from '../../architecture/base/utilities/types';
import { type BaseCommand } from '../../architecture';

export function createSegmentedButtons(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  if (command instanceof BaseOptionCommand && command.optionType === OptionType.Segmented) {
    return <SegmentedButtons key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  return undefined;
}

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
  const selectedUniqueId = useCommandProperty(command, () => getSelectedKey(command));

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
        currentKey={selectedUniqueId}
        fullWidth
        onButtonClicked={(selectedUniqueId: UniqueId) => {
          if (command.children === undefined) {
            return;
          }
          for (const child of command.children) {
            if (child.uniqueId === selectedUniqueId) {
              child.invoke();
              renderTarget.domElement.focus();
              break;
            }
          }
        }}>
        {command.children.map((child) => (
          <SegmentedControl.Button
            key={child.uniqueId}
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

function getSelectedKey(command: BaseOptionCommand): UniqueId {
  const child = command.selectedChild;
  if (child === undefined) {
    return 'undefined';
  }
  return child.uniqueId;
}
