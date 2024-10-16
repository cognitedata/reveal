/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo, useCallback } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getButtonType, getDefaultCommand, getIcon, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './IconComponentMapper';

export const CommandButton = ({
  inputCommand,
  isHorizontal = false
}: {
  inputCommand: BaseCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseCommand>(() => getDefaultCommand(inputCommand, renderTarget), []);

  // @update-ui-component-pattern
  const [isChecked, setChecked] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  const update = useCallback((command: BaseCommand) => {
    setChecked(command.isChecked);
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  }, []);

  useEffect(() => {
    update(command);
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command]);
  // @end

  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const label = command.getLabel(t);

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
      appendTo={document.body}
      placement={placement}>
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
