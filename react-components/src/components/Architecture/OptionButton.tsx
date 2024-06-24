/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Button, Dropdown, Menu, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import styled from 'styled-components';
import { getButtonType, getDefaultCommand, getIcon, getPlacement } from './utilities';

export const OptionButton = ({
  command,
  isHorizontal = false
}: {
  command: BaseOptionCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const newCommand = useMemo<BaseCommand>(() => getDefaultCommand(command, renderTarget), []);

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
    update(newCommand);
    newCommand.addEventListener(update);
    return () => {
      newCommand.removeEventListener(update);
    };
  }, [newCommand]);

  if (!(newCommand instanceof BaseOptionCommand)) {
    return <></>;
  }
  if (!isVisible) {
    return <></>;
  }
  const placement = getPlacement(isHorizontal);
  const tooltip = newCommand.getLabel(t);
  const commands = newCommand.getOptions(renderTarget);
  const selectedLabel = commands.find((command) => command.isChecked)?.getLabel(t);

  return (
    <CogsTooltip content={tooltip} placement={placement} appendTo={document.body}>
      <Dropdown
        hideOnSelect={true}
        appendTo={document.body}
        onClickOutside={() => {
          setOpen(false);
        }}
        content={
          <StyledMenu>
            <>
              {commands.map((command, _index): ReactElement => {
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
            </>
          </StyledMenu>
        }
        placement="right-start">
        <Button
          style={{ padding: '8px 4px' }}
          type={getButtonType(newCommand)}
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

const StyledMenu = styled(Menu)`
  min-width: 0px;
  overflow: auto;
`;
