/*!
 * Copyright 2024 Cognite AS
 */

import {
  Button,
  Menu,
  Tooltip as CogsTooltip,
  ChevronDownIcon,
  ChevronUpIcon
} from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type MouseEvent
} from 'react';

import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement,
  getIcon
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './IconComponent';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { useClickOutside } from './useClickOutside';
import { DEFAULT_PADDING, OPTION_MIN_WIDTH } from './constants';

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
  const command = useMemo<BaseOptionCommand>(
    () => getDefaultCommand<BaseOptionCommand>(inputCommand, renderTarget),
    []
  );

  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

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

  const outsideAction = (): boolean => {
    if (!isOpen) {
      return false;
    }
    postAction();
    return true;
  };

  const postAction = (): void => {
    setOpen(false);
    renderTarget.domElement.focus();
  };

  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(menuRef, outsideAction);

  if (!isVisible || command.children === undefined) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const label = usedInSettings ? undefined : command.getLabel(t);
  const flexDirection = getFlexDirection(isHorizontal);
  const children = command.children;
  const selectedLabel = command.selectedChild?.getLabel(t);

  const OpenButtonIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={tooltip} shortcut={shortcut} />}
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
          iconPlacement="right"
          aria-label={command.getLabel(t)}
          onClick={(event: MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            event.preventDefault();
            setOpen((prevState) => !prevState);
          }}>
          {selectedLabel}
        </Button>
      </CogsTooltip>
    </Dropdown>
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
