import React, { FunctionComponent } from 'react';
import { Button, Colors, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Integration } from '../../model/Integration';

const TableOptionDropdown = styled((props) => (
  <Dropdown {...props}>{props.children}</Dropdown>
))`
  .tippy-content {
    padding: 0;
    .cogs-menu-item {
      color: ${Colors.black.hex()};
    }
  }
`;
const OptionMenuBtn = styled((props) => (
  <Button {...props}>{props.children}</Button>
))`
  background-color: transparent;
  color: ${Colors.black.hex()};
  :hover {
    background-color: transparent;
    box-shadow: none;
  }
  .cogs-icon {
    svg {
      width: inherit;
    }
  }
`;

interface OwnProps {
  integration: Integration;
}

type Props = OwnProps;

const IntegrationsTableOptions: FunctionComponent<Props> = ({
  integration,
}: Props) => {
  const MenuContent = (
    <Menu>
      <Menu.Header>Actions</Menu.Header>
      <Menu.Item key="0">View integration details</Menu.Item>
      <Menu.Item key="1">Update integration</Menu.Item>
      <Menu.Item key="2">View data stream and source</Menu.Item>
      <Menu.Item key="4">Download configuration</Menu.Item>
    </Menu>
  );
  return (
    <>
      <TableOptionDropdown content={MenuContent}>
        <OptionMenuBtn aria-label={`Actions for ${integration.name}`}>
          <Icon type="VerticalEllipsis" />
        </OptionMenuBtn>
      </TableOptionDropdown>
    </>
  );
};

export default IntegrationsTableOptions;
