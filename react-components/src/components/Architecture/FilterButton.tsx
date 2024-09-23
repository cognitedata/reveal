/*!
 * Copyright 2024 Cognite AS
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type MouseEvent
} from 'react';
import { Button, Tooltip as CogsTooltip, ChevronUpIcon, ChevronDownIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
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
import styled from 'styled-components';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterItem } from './FilterItem';
import { OPTION_MIN_WIDTH, DEFAULT_PADDING } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './IconComponentMapper';

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
  const [icon, setIcon] = useState<IconName | undefined>(undefined);
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
    <Menu
      style={{
        minWidth: '100px',
        overflow: 'auto',
        flexDirection
      }}
      visible={isOpen}
      hideOnSelect={false}
      appendTo={'parent'}
      placement={usedInSettings ? 'bottom-end' : 'auto-start'}
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={usedInSettings || label === undefined}
          appendTo={document.body}
          placement={placement}>
          <Button
            type={usedInSettings ? 'tertiary' : getButtonType(command)}
            icon={
              usedInSettings ? (
                isOpen ? (
                  <ChevronUpIcon />
                ) : (
                  <ChevronDownIcon />
                )
              ) : (
                <IconComponent iconName={icon} />
              )
            }
            key={uniqueId}
            disabled={!isEnabled}
            toggled={isOpen}
            iconPlacement="right"
            aria-label={command.getLabel(t)}
            style={{
              minWidth: usedInSettings ? OPTION_MIN_WIDTH : undefined,
              padding: usedInSettings ? DEFAULT_PADDING : undefined
            }}
            onClick={(event: MouseEvent<HTMLElement>) => {
              setOpen(!isOpen);
              event.stopPropagation();
              event.preventDefault();
            }}
            {...props}>
            {usedInSettings ? selectedLabel : undefined}
          </Button>
        </CogsTooltip>
      )}>
      <Menu.ItemAction
        key={-1}
        toggled={isAllChecked}
        onClick={() => {
          command.toggleAllChecked();
        }}>
        {BaseFilterCommand.getAllString(t)}
      </Menu.ItemAction>
      <StyledMenuItems>
        {children.map((child, _index): ReactElement => {
          return <FilterItem key={child.uniqueId} command={child} />;
        })}
      </StyledMenuItems>
    </Menu>
  );
};

const StyledMenuItems = styled.div`
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
`;
