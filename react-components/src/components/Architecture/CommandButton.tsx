/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, useState, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getButtonType, getDefaultCommand, getIcon, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './IconComponentMapper';
import { useOnUpdate } from './useOnUpdate';
import { type PlacementType } from './types';
import { TOOLTIP_DELAY } from './constants';

export const CommandButton = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseCommand;
  placement: PlacementType;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseCommand>(() => getDefaultCommand(inputCommand, renderTarget), []);

  // @update-ui-component-pattern
  const [isChecked, setChecked] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  useOnUpdate(command, () => {
    setChecked(command.isChecked);
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  const label = command.getLabel(t);

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
      appendTo={document.body}
      enterDelay={TOOLTIP_DELAY}
      placement={getTooltipPlacement(placement)}>
      <Button
        type={getButtonType(command)}
        icon={<IconComponent iconName={icon} />}
        key={uniqueId}
        disabled={!isEnabled}
        toggled={isChecked}
        aria-label={label}
        iconPlacement="left"
        onClick={() => {
          command.invoke();
          renderTarget.domElement.focus();
        }}></Button>
    </CogsTooltip>
  );
};
