/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, Divider, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';

export const CommandButtons = ({
  commands,
  isHorizontal = false,
  reuse = true
}: {
  commands: Array<BaseCommand | undefined>;
  isHorizontal: boolean;
  reuse: boolean;
}): ReactElement => {
  return (
    <>
      {commands.map(
        (command, index): ReactElement => addCommandButton(command, isHorizontal, reuse, index)
      )}
    </>
  );
};

export const CreateCommandButton = (command: BaseCommand, isHorizontal = false): ReactElement => {
  return (
    <CommandButton key={command.name} command={command} isHorizontal={isHorizontal} reuse={true} />
  );
};

export const CommandButton = ({
  command,
  isHorizontal = false,
  reuse = true
}: {
  command: BaseCommand;
  isHorizontal: boolean;
  reuse: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const newCommand = useMemo<BaseCommand>(
    () => getDefaultCommand(command, renderTarget, reuse),
    []
  );

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

function getDefaultCommand(
  newCommand: BaseCommand,
  renderTarget: RevealRenderTarget,
  reuse: boolean
): BaseCommand {
  if (reuse) {
    // If it exists from before, return the existing command
    // Otherwise, add the new command to the controller and attach the renderTarget
    const oldCommand = renderTarget.commandsController.getEqual(newCommand);
    if (oldCommand !== undefined) {
      return oldCommand;
    }
    renderTarget.commandsController.add(newCommand);
  }
  if (newCommand instanceof RenderTargetCommand) {
    newCommand.attach(renderTarget);
  }
  return newCommand;
}

function addCommandButton(
  command: BaseCommand | undefined,
  isHorizontal: boolean,
  reuse: boolean,
  index: number
): ReactElement {
  if (command === undefined) {
    const direction = !isHorizontal ? 'horizontal' : 'vertical';
    return <Divider key={index} weight="2px" length="24px" direction={direction} />;
  }
  return (
    <CommandButton key={command.name} command={command} isHorizontal={isHorizontal} reuse={reuse} />
  );
}
