/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, Divider, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { OptionButton } from './OptionButton';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { getButtonType, getDefaultCommand, getIcon, getTooltipPlacement } from './utilities';

export const CommandButtons = ({
  commands,
  isHorizontal = false
}: {
  commands: Array<BaseCommand | undefined>;
  isHorizontal: boolean;
}): ReactElement => {
  return (
    <>
      {commands.map(
        (command, index): ReactElement => (
          <CommandButtonWrapper
            command={command}
            isHorizontal={isHorizontal}
            key={getKey(command, index)}
          />
        )
      )}
    </>
  );
};

export const CreateButton = (command: BaseCommand, isHorizontal = false): ReactElement => {
  if (command instanceof BaseOptionCommand) {
    return <OptionButton inputCommand={command} isHorizontal={isHorizontal} />;
  } else {
    return <CommandButton inputCommand={command} isHorizontal={isHorizontal} />;
  }
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

  useEffect(() => {
    function update(command: BaseCommand): void {
      setChecked(command.isChecked);
      setEnabled(command.isEnabled);
      setVisible(command.isVisible);
      setUniqueId(command.uniqueId);
      setIcon(getIcon(command));
    }
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
  return (
    <CogsTooltip content={tooltip} placement={placement} appendTo={document.body}>
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
        }}
      />
    </CogsTooltip>
  );
};

function getKey(command: BaseCommand | undefined, index: number): number {
  if (command === undefined) {
    return -index;
  }

  return command.uniqueId;
}

function CommandButtonWrapper({
  command,
  isHorizontal
}: {
  command: BaseCommand | undefined;
  isHorizontal: boolean;
}): ReactElement {
  if (command === undefined) {
    const direction = !isHorizontal ? 'horizontal' : 'vertical';
    return <Divider weight="2px" length="24px" direction={direction} />;
  }
  return CreateButton(command);
}
