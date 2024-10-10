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
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { Menu, SelectPanel } from '@cognite/cogs-lab';
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
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterItem } from './FilterItem';
import { OPTION_MIN_WIDTH, DEFAULT_PADDING } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './IconComponentMapper';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';

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
  const [isSomeChecked, setSomeChecked] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const update = useCallback(
    (command: BaseCommand) => {
      setEnabled(command.isEnabled);
      setVisible(command.isVisible);
      setUniqueId(command.uniqueId);
      setIcon(getIcon(command));
      if (command instanceof BaseFilterCommand) {
        setAllChecked(command.isAllChecked);
        setSomeChecked(command.children?.some((child) => child.isChecked) === true);
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
  const label = command.getLabel(t);
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
      label={usedInSettings ? label : undefined}
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      onOpenChange={setOpen}
      appendTo={'parent'}
      placement={usedInSettings ? 'right-start' : 'right-start'}
      disableCloseOnClickInside
      renderTrigger={
        usedInSettings
          ? undefined
          : (props: any) => (
              <CogsTooltip
                content={<LabelWithShortcut label={label} command={command} />}
                disabled={isOpen || usedInSettings || label === undefined}
                appendTo={document.body}
                placement={placement}>
                <Button
                  type={usedInSettings ? 'tertiary' : getButtonType(command)}
                  icon={getButtonIcon(usedInSettings)}
                  key={uniqueId}
                  disabled={!isEnabled}
                  toggled={isOpen}
                  iconPlacement="left"
                  aria-label={command.getLabel(t)}
                  style={{
                    minWidth: usedInSettings ? OPTION_MIN_WIDTH : undefined,
                    padding: usedInSettings ? DEFAULT_PADDING : undefined
                  }}
                  {...props}
                  onClick={(event: MouseEvent<HTMLElement>) => {
                    event.stopPropagation();
                    event.preventDefault();
                    props.onClick(event);
                  }}>
                  {usedInSettings ? selectedLabel : undefined}
                </Button>
              </CogsTooltip>
            )
      }>
      <SelectPanel.Header title={label} />
      <SelectPanel.Body label={label}>
        <SelectPanel.Section>
          <SelectPanel.Item
            key={-1}
            variant="checkbox"
            checked={isAllChecked}
            indeterminate={!isAllChecked && isSomeChecked}
            onClick={() => {
              command.toggleAllChecked();
            }}
            label={BaseFilterCommand.getAllString(t)}>
            {BaseFilterCommand.getAllString(t)}
          </SelectPanel.Item>
        </SelectPanel.Section>

        <SelectPanel.Section>
          {children.map((child, _index): ReactElement => {
            return <FilterItem key={child.uniqueId} command={child} />;
          })}
        </SelectPanel.Section>
      </SelectPanel.Body>
    </Menu>
  );

  function getButtonIcon(usedInSettings: boolean): ReactElement | undefined {
    return usedInSettings ? undefined : <IconComponent iconName={icon} />;
  }
};
