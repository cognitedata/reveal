/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement,
  getIcon
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { useClickOutside } from './useClickOutside';

export const OptionButton = ({
  inputCommand,
  isHorizontal = false,
  usedInSettings = false
}: {
  inputCommand: BaseOptionCommand;
  isHorizontal: boolean;
  usedInSettings?: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseCommand>(() => getDefaultCommand(inputCommand, renderTarget), []);

  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);

  const postAction = (): void => {
    setOpen(false);
    renderTarget.domElement.focus();
  };

  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(menuRef, () => {
    postAction();
  });

  const update = useCallback((command: BaseCommand) => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
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
  const tooltip = usedInSettings ? undefined : command.getLabel(t);
  const shortcut = command.getShortCutKeys();
  const flexDirection = getFlexDirection(isHorizontal);
  const options = command.options;
  const selectedLabel = command.selectedOption?.getLabel(t);

  return (
    <div ref={menuRef}>
      <CogsTooltip
        content={<LabelWithShortcut label={tooltip} shortcut={shortcut} />}
        disabled={tooltip === undefined}
        appendTo={document.body}
        placement={placement}>
        <Dropdown
          visible={isOpen}
          hideOnSelect={true}
          appendTo={document.body}
          placement={usedInSettings ? 'bottom-end' : 'auto-start'}
          content={
            <Menu
              style={{
                minWidth: '0px',
                overflow: 'auto',
                flexDirection
              }}>
              {options.map((command, _index): ReactElement => {
                return createMenuItem(command, t, postAction);
              })}
            </Menu>
          }>
          <Button
            style={{ padding: '8px 4px' }}
            type={getButtonType(command)}
            icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
            key={uniqueId}
            disabled={!isEnabled}
            toggled={isOpen}
            iconPlacement="right"
            onClick={() => {
              setOpen((prevState) => !prevState);
            }}>
            {selectedLabel}
          </Button>
        </Dropdown>
      </CogsTooltip>
    </div>
  );
};

export function createMenuItem(
  command: BaseCommand,
  t: TranslateDelegate,
  postAction: () => void
): ReactElement {
  return (
    <Menu.Item
      key={command.uniqueId}
      icon={getIcon(command)}
      disabled={!command.isEnabled}
      toggled={command.isChecked}
      iconPlacement="right"
      onClick={() => {
        command.invoke();
        postAction();
      }}>
      {command.getLabel(t)}
    </Menu.Item>
  );
}
