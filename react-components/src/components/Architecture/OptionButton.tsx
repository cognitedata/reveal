/*!
 * Copyright 2024 Cognite AS
 */

import { Button, Tooltip as CogsTooltip, ChevronDownIcon, ChevronUpIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import {
  useCallback,
  useEffect,
  useMemo,
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
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { DEFAULT_PADDING, OPTION_MIN_WIDTH } from './constants';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';

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
    <Menu
      style={{
        minWidth: '0px',
        overflow: 'auto',
        flexDirection
      }}
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      onOpenChange={(open: boolean) => {
        setOpen(open);
      }}
      hideOnSelect={true}
      appendTo={'parent'}
      placement={usedInSettings ? 'bottom-end' : 'auto-start'}
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={usedInSettings || label === undefined}
          appendTo={document.body}
          placement={placement}>
          <Button
            style={{
              padding: usedInSettings ? DEFAULT_PADDING : '8px 4px',
              minWidth: usedInSettings ? OPTION_MIN_WIDTH : undefined
            }}
            type={usedInSettings ? 'tertiary' : getButtonType(command)}
            icon={<OpenButtonIcon />}
            key={uniqueId}
            disabled={!isEnabled}
            iconPlacement="right"
            aria-label={command.getLabel(t)}
            label={selectedLabel}
            toggled={isOpen}
            {...props}
            onClick={(event: MouseEvent<HTMLElement>) => {
              props.onClick?.(event);
              event.stopPropagation();
              event.preventDefault();
            }}>
            {selectedLabel}
          </Button>
        </CogsTooltip>
      )}>
      {children.map((child, _index): ReactElement => {
        return createMenuItem(child, t);
      })}
    </Menu>
  );
};

function createMenuItem(command: BaseCommand, t: TranslateDelegate): ReactElement {
  return (
    <Menu.ItemToggled
      key={command.uniqueId}
      icon={getIcon(command)}
      disabled={!command.isEnabled}
      toggled={command.isChecked}
      iconPlacement="right"
      label={command.getLabel(t)}
      onClick={() => {
        command.invoke();
      }}
    />
  );
}
