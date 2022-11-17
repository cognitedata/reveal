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

  const [dayAheadMarketDropdownVisible, setDayAheadMarketDropdownVisible] =
    useState<boolean>(false);
  const [balancingMarketsDropdownVisible, setBalancingMarketsDropdownVisible] =
    useState<boolean>(false);

  const { data: allPriceAreas = [] } = useFetchPriceAreas();

  const toggleDayAheadMarketDropdown = () => {
    setDayAheadMarketDropdownVisible(!dayAheadMarketDropdownVisible);
  };

  const toggleBalancingMarketsDropdown = () => {
    setBalancingMarketsDropdownVisible(!balancingMarketsDropdownVisible);
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
          type={
            dayAheadMarketDropdownVisible
              ? 'ChevronUpSmall'
              : 'ChevronDownSmall'
          }
          style={{
            position: 'absolute',
            top: '19.5px',
            left: '435px',
          }}
        />
        <Dropdown
          className="day-ahead-market-dropdown"
          visible={dayAheadMarketDropdownVisible}
          onClickOutside={() => setDayAheadMarketDropdownVisible(false)}
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
        <Icon
          type={
            balancingMarketsDropdownVisible
              ? 'ChevronUpSmall'
              : 'ChevronDownSmall'
          }
          style={{
            position: 'absolute',
            top: '19.5px',
            left: '597px',
          }}
        />
        <Dropdown
          className="balancing-markets-dropdown"
          visible={balancingMarketsDropdownVisible}
          onClickOutside={() => setBalancingMarketsDropdownVisible(false)}
          content={
            <StyledMenu style={{ position: 'absolute', left: '164px' }}>
              <Menu.Item
                selected={pathname.includes(`${PAGES.BALANCING_MARKETS}`)}
                key="rkom"
                onClick={() => {
                  history.push({
                    pathname: PAGES.RKOM_BID,
                  });
                }}
                appendIcon={
                  pathname.includes(`${PAGES.RKOM_BID}`)
                    ? 'Checkmark'
                    : undefined
                }
              >
                RKOM
              </Menu.Item>
            </StyledMenu>
          }
        />
        <TopBar.Navigation
          links={[
            {
              name: 'Day Ahead Market',
              isActive: pathname.includes(PAGES.DAY_AHEAD_MARKET),
              onClick: () => toggleDayAheadMarketDropdown(),
            },
            {
              name: 'Balancing Markets',
              isActive: pathname.includes(PAGES.BALANCING_MARKETS),
              onClick: () => toggleBalancingMarketsDropdown(),
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
