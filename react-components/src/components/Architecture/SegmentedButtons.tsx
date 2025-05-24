/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { SegmentedControl, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getTooltipPlacement } from './utilities';
import { type BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './Factories/IconFactory';
import { type PlacementType } from './types';
import { TOOLTIP_DELAY } from './constants';
import { useProperty } from './useProperty';
import { useCommand } from './useCommand';
import { useCommonCommandProps } from './useCommonCommandProps';

export const SegmentedButtons = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseOptionCommand;
  placement: PlacementType;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useCommand(inputCommand);
  const selected = useProperty(command, () => getSelectedKey(command));
  const { uniqueId, isVisible, isEnabled } = useCommonCommandProps(command);

  if (!isVisible || command.children === undefined) {
    return <></>;
  }
  const label = command.getLabel(t);

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
            aria-label={child.getLabel(t)}>
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
