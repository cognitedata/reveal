/*!
 * Copyright 2023 Cognite AS
 */

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Button,
  Menu,
  Tooltip as CogsTooltip,
  ChevronDownIcon,
  ChevronUpIcon
} from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getIcon,
  getTooltipPlacement
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './IconComponent';
import { type IconName } from '../../architecture/base/utilities/IconName';

export const OptionButton = ({
  inputCommand,
  isHorizontal = false
}: {
  inputCommand: BaseOptionCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseCommand>(() => getDefaultCommand(inputCommand, renderTarget), []);

  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  const update = useCallback((command: BaseCommand) => {
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

  if (!(command instanceof BaseOptionCommand)) {
    return <></>;
  }
  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const tooltip = command.getLabel(t);
  const shortcut = command.getShortCutKeys();
  const flexDirection = getFlexDirection(isHorizontal);
  const options = command.getOrCreateOptions(renderTarget);
  const selectedLabel = command.selectedOption?.getLabel(t);

  const OpenButtonIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;

  return (
    <CogsTooltip
      content={<LabelWithShortcut key={tooltip} label={tooltip} shortcut={shortcut} />}
      appendTo={document.body}
      placement={placement}>
      <Dropdown
        hideOnSelect={true}
        onClickOutside={() => {
          setOpen(false);
          renderTarget.domElement.focus();
        }}
        placement="bottom"
        content={
          <Menu
            style={{
              minWidth: '0px',
              overflow: 'auto',
              flexDirection
            }}>
            {options.map((command, _index): ReactElement => {
              return (
                <Menu.Item
                  icon={<IconComponent iconName={icon} />}
                  key={command.uniqueId}
                  toggled={command.isChecked}
                  disabled={!isEnabled}
                  aria-label={tooltip}
                  iconPlacement="right"
                  onClick={() => {
                    command.invoke();
                    setOpen(false);
                    renderTarget.domElement.focus();
                  }}>
                  {command.getLabel(t)}
                </Menu.Item>
              );
            })}
          </Menu>
        }>
        <Button
          style={{ padding: '8px 4px' }}
          type={getButtonType(command)}
          icon={<OpenButtonIcon />}
          key={uniqueId}
          disabled={!isEnabled}
          toggled={isOpen}
          aria-label={tooltip}
          iconPlacement="right"
          onClick={() => {
            setOpen((prevState) => !prevState);
          }}>
          {selectedLabel}
        </Button>
      </Dropdown>
    </CogsTooltip>
  );
};
