import { useState } from 'react';
import { generatePath, useHistory, useRouteMatch } from 'react-router-dom';
import { Dropdown, Icon, Menu, TopBar } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';
import { handleLogout } from 'utils/utils';
import { PAGES } from 'App';
import { useFetchPriceAreas } from 'queries/useFetchPriceArea';

import {
  StyledTopBar,
  LogoContainer,
  LogOutButtonContainer,
  StyledMenu,
} from './elements';

export const MenuBar = () => {
  const history = useHistory();
  const { path } = useRouteMatch({ path: history.location.pathname }) ?? {
    path: null,
  };
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
            left: '372px',
          }}
        />
        <Dropdown
          visible={visible}
          onClickOutside={() => setVisible(false)}
          content={
            <StyledMenu>
              <Menu.Header>Price Area</Menu.Header>
              {allPriceAreas.map((pricearea) => (
                <Menu.Item
                  selected={path?.includes(
                    `${PAGES.PORTFOLIO}/${pricearea.externalId}`
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
                    path?.includes(`${PAGES.PORTFOLIO}/${pricearea.externalId}`)
                      ? 'Checkmark'
                      : undefined
                  }
                >
                  {pricearea.name}
                </Menu.Item>
              ))}
            </StyledMenu>
          }
        >
          <TopBar.Navigation
            links={[
              {
                name: 'Portfolio',
                isActive: path?.includes(PAGES.PORTFOLIO),
                onClick: () => toggleDropdown(),
              },
              {
                name: 'Workflows',
                isActive: path === PAGES.WORKFLOWS,
                onClick: () => history.push(PAGES.WORKFLOWS),
              },
              {
                name: 'Monitoring',
                isActive: path === PAGES.MONITORING,
                onClick: () => history.push(PAGES.MONITORING),
              },
            ]}
          />
        </Dropdown>
      </TopBar.Left>
      <TopBar.Right>
        <LogOutButtonContainer>
          <LogoutButton handleClick={() => handleLogout(history)} />
        </LogOutButtonContainer>
      </TopBar.Right>
    </StyledTopBar>
  );
};
