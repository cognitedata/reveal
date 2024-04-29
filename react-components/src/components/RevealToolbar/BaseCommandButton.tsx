/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/renderTarget/RevealRenderTarget';

type CreateCommandDelegate = (renderTarget: RevealRenderTarget) => BaseCommand;

export const BaseCommandButton = (createCommandDelegate: CreateCommandDelegate): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const [command] = useState<BaseCommand>(createCommand());

  function createCommand(): BaseCommand {
    const newCommand = createCommandDelegate(renderTarget);
    const oldCommand = renderTarget.commandController.getEqual(newCommand);
    if (oldCommand !== undefined) {
      return oldCommand;
    }
    renderTarget.commandController.add(newCommand);
    return newCommand;
  }

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

  const toolTip = t(command.tooltipKey, command.tooltip);
  return (
    <CogsTooltip content={toolTip} placement="right" appendTo={document.body}>
      <Button
        type="ghost"
        icon={command.icon as IconType}
        toggled={isChecked}
        disabled={!isEnabled}
        aria-label={command.name}
        onClick={() => {
          command.invoke();
        }}
      />
    </CogsTooltip>
  );
};
