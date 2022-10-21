import { useState } from 'react';
import { generatePath, useHistory, useLocation } from 'react-router-dom';
import { Dropdown, Icon, Menu, TopBar } from '@cognite/cogs.js';
import {
  LogoutButton,
  useAuthenticatedAuthContext,
} from '@cognite/react-container';
import { handleLogout } from 'utils/utils';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { PAGES } from 'types';

import {
  StyledTopBar,
  LogoContainer,
  LogOutButtonContainer,
  StyledMenu,
} from './elements';

export const MenuBar = () => {
  const { authState } = useAuthenticatedAuthContext();
  const history = useHistory();
  const { pathname } = useLocation();

  const [visible, setVisible] = useState<boolean>(false);
  const { data: allPriceAreas = [] } = useFetchPriceAreas();

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  return (
    <StyledTopBar data-testid="top-bar">
      <TopBar.Left>
        <LogoContainer>
          <TopBar.Logo title="Power Market Operations" />
        </LogoContainer>
        {/* TODO(POWEROPS-198):
            Temporary fix until dropdown functionality is added to TopBar in the Design System
        */}
        <Icon
          type={visible ? 'ChevronUpSmall' : 'ChevronDownSmall'}
          style={{
            position: 'absolute',
            top: '19.5px',
            left: '435px',
          }}
        />
        <Dropdown
          className="top-bar-dropdown"
          visible={visible}
          onClickOutside={() => setVisible(false)}
          content={
            <StyledMenu>
              <Menu.Header>Price Areas</Menu.Header>
              {allPriceAreas.map((pricearea) => (
                <Menu.Item
                  selected={pathname.includes(
                    `${PAGES.DAY_AHEAD_MARKET}/${pricearea.externalId}`
                  )}
                  key={pricearea.externalId}
                  onClick={() => {
                    history.push(
                      generatePath(`${PAGES.PRICE_AREA}/total`, {
                        priceAreaExternalId: pricearea.externalId,
                      })
                    );
                  }}
                  appendIcon={
                    pathname.includes(
                      `${PAGES.DAY_AHEAD_MARKET}/${pricearea.externalId}`
                    )
                      ? 'Checkmark'
                      : undefined
                  }
                >
                  {pricearea.name}
                </Menu.Item>
              ))}
            </StyledMenu>
          }
        />
        <TopBar.Navigation
          links={[
            {
              name: 'Day Ahead Market',
              isActive: pathname.includes(PAGES.DAY_AHEAD_MARKET),
              onClick: () => toggleDropdown(),
            },
            {
              name: 'Workflows',
              isActive: pathname.includes(PAGES.WORKFLOWS),
              onClick: () => history.push(PAGES.WORKFLOWS),
            },
            ...(authState.email?.includes('@cognite')
              ? [
                  {
                    name: 'Workflow Schemas',
                    isActive: pathname.includes(PAGES.WORKFLOW_SCHEMAS),
                    onClick: () => history.push(PAGES.WORKFLOW_SCHEMAS),
                  },
                  {
                    name: 'Monitoring',
                    isActive: pathname.includes(PAGES.MONITORING),
                    onClick: () => history.push(PAGES.MONITORING),
                  },
                ]
              : []),
          ]}
        />
      </TopBar.Left>
      <TopBar.Right>
        <LogOutButtonContainer>
          <LogoutButton handleClick={() => handleLogout(history)} />
        </LogOutButtonContainer>
      </TopBar.Right>
    </StyledTopBar>
  );
};
