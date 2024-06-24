/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Button, Dropdown, Menu, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
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
  const [icon, setIcon] = useState<IconType | undefined>(undefined);

  useEffect(() => {
    function update(command: BaseCommand): void {
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
  }, [command]);

  if (!(command instanceof BaseOptionCommand)) {
    return <></>;
  }
  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const flexDirection = getFlexDirection(isHorizontal);
  const tooltip = command.getLabel(t);
  const options = command.getOrCreateOptions(renderTarget);
  const selectedLabel = command.selectedOption?.getLabel(t);

  return (
    <CogsTooltip content={tooltip} placement={placement} appendTo={document.body}>
      <Dropdown
        hideOnSelect={true}
        appendTo={document.body}
        onClickOutside={() => {
          setOpen(false);
        }}
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
                  icon={icon}
                  key={command.uniqueId}
                  toggled={command.isChecked}
                  disabled={!isEnabled}
                  aria-label={tooltip}
                  iconPlacement="right"
                  onClick={() => {
                    command.invoke();
                    setOpen(false);
                  }}>
                  {command.getLabel(t)}
                </Menu.Item>
              );
            })}
          </Menu>
        }
        placement="auto-start">
        <Button
          style={{ padding: '8px 4px' }}
          type={getButtonType(command)}
          icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
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
