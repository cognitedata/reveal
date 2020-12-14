import React, { FunctionComponent, useState } from 'react';
import { Button, Colors, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Integration } from '../../model/Integration';
import DetailsModal from '../test/DetailsModal';

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

export enum IntegrationAction {
  VIEW_EDIT_DETAILS = 'View/edit integration',
}

interface OwnProps {
  integration: Integration;
}

type Props = OwnProps;

const IntegrationsTableActions: FunctionComponent<Props> = ({
  integration,
}: Props) => {
  const [integrationDetailVisible, setIntegrationDetailVisible] = useState(
    false
  );

  const openIntegrationDetails = () => {
    setIntegrationDetailVisible(true);
  };
  const onIntegrationDetailsCancel = () => {
    setIntegrationDetailVisible(false);
  };

  return (
    <>
      <TableOptionDropdown
        content={
          <Menu>
            <Menu.Header>Actions</Menu.Header>
            <Menu.Item key="0" onClick={openIntegrationDetails}>
              {IntegrationAction.VIEW_EDIT_DETAILS}
            </Menu.Item>
          </Menu>
        }
      >
        <OptionMenuBtn aria-label={`Actions for ${integration.name}`}>
          <Icon type="VerticalEllipsis" />
        </OptionMenuBtn>
      </TableOptionDropdown>
      <DetailsModal
        onCancel={onIntegrationDetailsCancel}
        visible={integrationDetailVisible}
        integration={integration}
      />
    </>
  );
};

export default IntegrationsTableActions;
