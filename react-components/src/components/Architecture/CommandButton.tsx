/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getButtonType, getDefaultCommand, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './Factories/IconFactory';
import { type PlacementType } from './types';
import { TOOLTIP_DELAY } from './constants';
import { useProperty } from './useProperty';

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

  const icon = useProperty(command, () => command.icon);
  const uniqueId = useProperty(command, () => command.uniqueId);
  const isVisible = useProperty(command, () => command.isVisible);
  const isEnabled = useProperty(command, () => command.isEnabled);
  const isChecked = useProperty(command, () => command.isChecked);

  if (!isVisible) {
    return <></>;
  }
  const label = command.getLabel(t);

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
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
