import { type RefObject, useRef, type ReactElement } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './Factories/IconFactory';
import { type PlacementType } from './types';
import { TOOLTIP_DELAY } from './constants';
import { useCommand } from './hooks/useCommand';
import { useCommandProps } from './hooks/useCommandProps';

export function createButton(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  return <CommandButton key={command.uniqueId} inputCommand={command} placement={placement} />;
}

export const CommandButton = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseCommand;
  placement: PlacementType;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const command = useCommand(inputCommand);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { icon, uniqueId, isVisible, isEnabled, isChecked } = useCommandProps(command);
  if (!isVisible) {
    return <></>;
  }
  const label = command.label;
  updatePosition(command, buttonRef, placement);

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
      enterDelay={TOOLTIP_DELAY}
      placement={getTooltipPlacement(placement)}>
      <Button
        type={command.buttonType}
        ref={buttonRef}
        icon={<IconComponent iconName={icon} />}
        key={uniqueId}
        disabled={!isEnabled}
        toggled={isChecked}
        aria-label={label}
        iconPlacement="left"
        onClick={() => {
          updatePosition(command, buttonRef, placement);
          command.invoke();
          renderTarget.domElement.focus();
        }}></Button>
    </CogsTooltip>
  );
};

function updatePosition(
  command: BaseCommand,
  buttonRef: RefObject<HTMLButtonElement>,
  placement: PlacementType
): void {
  const button = buttonRef.current;
  if (button === null) {
    return;
  }
  const margin = 8;
  const rect = button.getBoundingClientRect();
  if (placement === 'left') {
    command.position = { x: rect.right + margin, y: rect.top };
  } else if (placement === 'right') {
    command.position = { x: rect.left - margin, y: rect.top };
  } else if (placement === 'top') {
    command.position = { x: rect.left, y: rect.bottom + margin };
  } else if (placement === 'bottom') {
    command.position = { x: rect.left, y: rect.top - margin };
  }
}
