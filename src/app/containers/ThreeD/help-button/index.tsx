import { Button, Colors, Dropdown, Menu } from '@cognite/cogs.js';
import {
  MouseNavigation,
  KeyboardNavigation,
  TouchNavigation,
} from 'app/containers/ThreeD/help-button/sections';
import { ids } from 'cogs-variables';
import styled from 'styled-components';

const HelpButton = (): JSX.Element => {
  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <MouseNavigation />
          <TouchNavigation />
          <KeyboardNavigation />
        </StyledMenu>
      }
      placement="right"
    >
      <Button icon="Help" />
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  background-color: ${Colors['surface--medium--inverted']};
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
`;

export default HelpButton;
