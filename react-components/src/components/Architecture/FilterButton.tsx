/*!
 * Copyright 2024 Cognite AS
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type MouseEvent
} from 'react';
import { Button, Dropdown, Menu, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement,
  getIcon
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { useClickOutside } from './useClickOutside';
import styled from 'styled-components';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterItem } from './FilterItem';

export const FilterButton = ({
  inputCommand,
  isHorizontal = false,
  usedInSettings = false
}: {
  inputCommand: BaseFilterCommand;
  isHorizontal: boolean;
  usedInSettings?: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseFilterCommand>(
    () => getDefaultCommand<BaseFilterCommand>(inputCommand, renderTarget),
    []
  );

  command.initializeChildrenIfNeeded();

  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconType | undefined>(undefined);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isAllChecked, setAllChecked] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const update = useCallback(
    (command: BaseCommand) => {
      setEnabled(command.isEnabled);
      setVisible(command.isVisible);
      setUniqueId(command.uniqueId);
      setIcon(getIcon(command));
      if (command instanceof BaseFilterCommand) {
        setAllChecked(command.isAllChecked);
        setSelectedLabel(command.getSelectedLabel(t));
      }
    },
    [command]
  );

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
    setOpen(false);
    renderTarget.domElement.focus();
    return true;
  };

  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(menuRef, outsideAction);

  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const label = usedInSettings ? undefined : command.getLabel(t);
  const flexDirection = getFlexDirection(isHorizontal);

  const children = command.children;
  if (children === undefined || !command.hasChildren) {
    return <></>;
  }
  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={usedInSettings || label === undefined}
      appendTo={document.body}
      placement={placement}>
      <Dropdown
        visible={isOpen}
        hideOnSelect={false}
        appendTo={'parent'}
        placement={usedInSettings ? 'bottom-end' : 'auto-start'}
        content={
          <div ref={menuRef}>
            <Menu
              style={{
                minWidth: '100px',
                overflow: 'auto',
                flexDirection
              }}>
              <Menu.Item
                key={-1}
                toggled={isAllChecked}
                onClick={() => {
                  command.toggleAllChecked();
                }}>
                {BaseFilterCommand.getAllString(t)}
              </Menu.Item>
              <StyledMenuItems>
                {children.map((child, _index): ReactElement => {
                  return <FilterItem key={child.uniqueId} command={child} />;
                })}
              </StyledMenuItems>
            </Menu>
          </div>
        }>
        <Button
          type={usedInSettings ? 'tertiary' : getButtonType(command)}
          icon={usedInSettings ? (isOpen ? 'ChevronUp' : 'ChevronDown') : icon}
          key={uniqueId}
          disabled={!isEnabled}
          toggled={isOpen}
          iconPlacement="right"
          aria-label={command.getLabel(t)}
          style={{
            minWidth: usedInSettings ? '100px' : undefined,
            padding: usedInSettings ? '4px 4px' : undefined
          }}
          onClick={(event: MouseEvent<HTMLElement>) => {
            setOpen(!isOpen);
            event.stopPropagation();
            event.preventDefault();
          }}>
          {usedInSettings ? selectedLabel : undefined}
        </Button>
      </Dropdown>
    </CogsTooltip>
  );
};

const StyledMenuItems = styled.div`
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
`;
