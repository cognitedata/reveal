/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo, useCallback } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getButtonType, getDefaultCommand, getIcon, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';

export const createCommandButton = (
  commandConstructor: () => BaseCommand,
  isHorizontal = false
): ReactElement => {
  const command = useMemo(commandConstructor, []);
  return <CommandButton inputCommand={command} isHorizontal={isHorizontal} />;
};

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

  const [isChecked, setChecked] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconType | undefined>(undefined);

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
  }, [command.isEnabled, command.isChecked, command.isVisible]);

  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const tooltip = command.getLabel(t);
  const shortcut = command.getShortCutKeys();

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={tooltip} shortcut={shortcut} />}
      appendTo={document.body}
      placement={placement}>
      <Button
        type={getButtonType(command)}
        icon={icon}
        key={uniqueId}
        disabled={!isEnabled}
        toggled={isChecked}
        aria-label={tooltip}
        iconPlacement="right"
        onClick={() => {
          command.invoke();
          renderTarget.domElement.focus();
        }}
      />
    </CogsTooltip>
  );
};
