import { type ReactElement } from 'react';
import { Dropdown } from '@cognite/cogs-lab';
import styled from 'styled-components';
import { MouseNavigation } from '../RevealToolbar/Help/MouseNavigation';
import { TouchNavigation } from '../RevealToolbar/Help/TouchNavigation';
import { KeyboardNavigation } from '../RevealToolbar/Help/KeyboardNavigation';
import { CommandButton } from './CommandButton';
import { type BaseCommand } from '../../architecture';
import { useCommand } from './hooks/useCommand';
import { HelpCommand } from '../../architecture/base/concreteCommands/general/HelpCommand';
import { getDropdownPlacement, DROP_DOWN_OFFSET } from './utilities';
import { type PlacementType } from './types';

export function createHelpButton(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  if (command instanceof HelpCommand) {
    return <HelpButton key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  return undefined;
}

export const HelpButton = ({
  inputCommand,
  placement
}: {
  inputCommand: HelpCommand;
  placement: PlacementType;
}): ReactElement => {
  const command = useCommand(inputCommand);
  return (
    <Dropdown
      onShow={(open) => {
        command.isChecked = open;
      }}
      onHide={(open) => {
        command.isChecked = open;
      }}
      onClickOutside={() => {
        command.isChecked = false;
      }}
      placement={getDropdownPlacement(placement)}
      offset={DROP_DOWN_OFFSET}
      content={
        <StyledContainer>
          <MouseNavigation />
          <KeyboardNavigation />
          <TouchNavigation />
        </StyledContainer>
      }>
      <CommandButton placement={placement} inputCommand={inputCommand} />
    </Dropdown>
  );
};

const StyledContainer = styled.div`
  background-color: #516efa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  width: fit-content;
  max-height: 20vw;
  overflow-y: auto;
`;
