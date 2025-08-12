import { type ReactElement } from 'react';
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
import { type IReactElementCreator } from './Factories/IReactElementCreator';

export class CommandButtonCreator implements IReactElementCreator {
  create(command: BaseCommand, placement: PlacementType): ReactElement | undefined {
    return <CommandButton key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
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

  const { icon, uniqueId, isVisible, isEnabled, isChecked } = useCommandProps(command);
  if (!isVisible) {
    return <></>;
  }
  const label = command.label;

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
      enterDelay={TOOLTIP_DELAY}
      placement={getTooltipPlacement(placement)}>
      <Button
        type={command.buttonType}
        icon={<IconComponent iconName={icon} />}
        key={uniqueId}
        disabled={!isEnabled}
        toggled={isChecked}
        aria-label={label}
        iconPlacement="left"
        onClick={() => {
          command.invoke();
          renderTarget.domElement.focus();
        }}></Button>
    </CogsTooltip>
  );
};
