/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';
import { useRenderTarget } from '../../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../../i18n/I18n';
import { type BaseCommand } from '../../../architecture/commands/BaseCommand';
import { type RevealRenderTarget } from '../../../architecture/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../../architecture/commands/RenderTargetCommand';

export const CommandButton = (inputCommand: BaseCommand): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const [command] = useState<BaseCommand>(getDefaultCommand(inputCommand, renderTarget));

  // These are redundant, but react fore me to add these to update
  const [isChecked, setChecked] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    function update(): void {
      setChecked(command.isChecked);
      setEnabled(command.isEnabled);
      setVisible(command.isVisible);
    }
    update();
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command]);

  if (!isVisible) {
    return <></>;
  }

  const { key, fallback } = command.tooltip;
  return (
    <CogsTooltip content={t(key, fallback)} placement="right" appendTo={document.body}>
      <Button
        type="ghost"
        icon={command.icon as IconType}
        toggled={isChecked}
        disabled={!isEnabled}
        aria-label={t(key, fallback)}
        onClick={() => {
          command.invoke();
        }}
      />
    </CogsTooltip>
  );
};

function getDefaultCommand(newCommand: BaseCommand, renderTarget: RevealRenderTarget): BaseCommand {
  // If it exists from before, return the existing command
  // Otherwise, add the new command to the controller and attach the renderTarget
  const oldCommand = renderTarget.toolController.getEqual(newCommand);
  if (oldCommand !== undefined) {
    return oldCommand;
  }
  renderTarget.toolController.add(newCommand);
  if (newCommand instanceof RenderTargetCommand) {
    newCommand.attach(renderTarget);
  }
  return newCommand;
}
