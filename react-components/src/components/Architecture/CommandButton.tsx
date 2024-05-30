/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';

export const CreateButton = (command: BaseCommand, isHorizontal = false): ReactElement => {
  return <CommandButton command={command} isHorizontal={isHorizontal} />;
};

export const CommandButton = ({
  command,
  isHorizontal = false
}: {
  command: BaseCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const newCommand = useMemo<BaseCommand>(() => getDefaultCommand(command, renderTarget), []);

  const [isChecked, setChecked] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [icon, setIcon] = useState<IconType>('Copy');

  useEffect(() => {
    function update(command: BaseCommand): void {
      setChecked(command.isChecked);
      setEnabled(command.isEnabled);
      setVisible(command.isVisible);
      setIcon(command.icon as IconType);
    }
    update(newCommand);
    newCommand.addEventListener(update);
    return () => {
      newCommand.removeEventListener(update);
    };
  }, [newCommand]);

  if (!isVisible) {
    return <></>;
  }
  const placement = isHorizontal ? 'top' : 'right';
  const { key, fallback } = newCommand.tooltip;
  return (
    <CogsTooltip content={t(key, fallback)} placement={placement} appendTo={document.body}>
      <Button
        type="ghost"
        icon={icon}
        toggled={isChecked}
        disabled={!isEnabled}
        aria-label={t(key, fallback)}
        onClick={() => {
          newCommand.invoke();
        }}
      />
    </CogsTooltip>
  );
};

function getDefaultCommand(newCommand: BaseCommand, renderTarget: RevealRenderTarget): BaseCommand {
  // If it exists from before, return the existing command
  // Otherwise, add the new command to the controller and attach the renderTarget
  const oldCommand = renderTarget.commandsController.getEqual(newCommand);
  if (oldCommand !== undefined) {
    return oldCommand;
  }
  renderTarget.commandsController.add(newCommand);
  if (newCommand instanceof RenderTargetCommand) {
    newCommand.attach(renderTarget);
  }
  return newCommand;
}
