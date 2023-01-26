import { useState } from 'react';
import { generatePath, useHistory, useLocation } from 'react-router-dom-v5';
import { Menu, Skeleton, TopBar } from '@cognite/cogs.js-v9';
import {
  LogoutButtonWithoutTranslation,
  useAuthenticatedAuthContext,
} from '@cognite/react-container';
import { handleLogout } from 'utils/utils';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { PAGES, SECTIONS } from 'types';

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

  const { data: allPriceAreas = [], status, refetch } = useFetchPriceAreas();

  const toggleDayAheadMarketDropdown = () => {
    setDayAheadMarketDropdownVisible(!dayAheadMarketDropdownVisible);
  };

  const toggleBalancingMarketsDropdown = () => {
    setBalancingMarketsDropdownVisible(!balancingMarketsDropdownVisible);
  };

  return (
    <StyledTopBar>
      <TopBar.Left>
        <LogoContainer>
          <TopBar.Logo title="Power Market Operations" />
        </LogoContainer>
        <TopBar.Navigation
          links={[
            {
              name: 'Day Ahead Market',
              isActive: pathname.includes(PAGES.DAY_AHEAD_MARKET),
              onClick: () => toggleDayAheadMarketDropdown(),
              dropdown: {
                className: 'day-ahead-market-dropdown',
                visible: { dayAheadMarketDropdownVisible },
                onClickOutside: () => setDayAheadMarketDropdownVisible(false),
                offset: [-16, 2],
                content: (
                  <StyledMenu>
                    <Menu.Header>Price Areas</Menu.Header>
                    {status === 'loading' && (
                      <>
                        <Menu.Item css={{}}>
                          <Skeleton.Rectangle width="150px" />
                        </Menu.Item>
                        <Menu.Item css={{}}>
                          <Skeleton.Rectangle width="150px" />
                        </Menu.Item>
                      </>
                    )}
                    {status === 'error' && (
                      <Menu.Item onClick={() => refetch()} css={{}}>
                        Error. Click to try again
                      </Menu.Item>
                    )}
                    {allPriceAreas.map((pricearea) => (
                      <Menu.Item
                        toggled={pathname.includes(
                          `${PAGES.DAY_AHEAD_MARKET}/${pricearea.externalId}`
                        )}
                        key={pricearea.externalId}
                        onClick={() => {
                          history.push(
                            generatePath(
                              `${PAGES.PRICE_AREA}/${SECTIONS.TOTAL}`,
                              {
                                priceAreaExternalId: pricearea.externalId,
                              }
                            )
                          );
                        }}
                        css={{}}
                      >
                        {pricearea.name}
                      </Menu.Item>
                    ))}
                  </StyledMenu>
                ),
              },
            },
            {
              name: 'Balancing Markets',
              isActive: pathname.includes(PAGES.BALANCING_MARKETS),
              onClick: () => toggleBalancingMarketsDropdown(),
              dropdown: {
                className: 'balancing-markets-dropdown',
                visible: { balancingMarketsDropdownVisible },
                onClickOutside: () => setBalancingMarketsDropdownVisible(false),
                offset: [-180, 2],
                content: (
                  <StyledMenu style={{ position: 'absolute', left: '164px' }}>
                    <Menu.Item
                      toggled={pathname.includes(`${PAGES.BALANCING_MARKETS}`)}
                      key="rkom"
                      onClick={() => {
                        history.push({
                          pathname: PAGES.RKOM_BID,
                        });
                      }}
                      css={{}}
                    >
                      RKOM
                    </Menu.Item>
                  </StyledMenu>
                ),
              },
            },
            {
              name: 'Workflows',
              isActive: pathname.includes(PAGES.WORKFLOWS),
              onClick: () => history.push(PAGES.WORKFLOWS),
            },
            {
              name: 'Workflow Schemas',
              isActive: pathname.includes(PAGES.WORKFLOW_SCHEMAS),
              onClick: () => history.push(PAGES.WORKFLOW_SCHEMAS),
            },
            ...(authState.email?.includes('@cognite')
              ? [
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
          <LogoutButtonWithoutTranslation
            onClick={() => handleLogout(history)}
          />
        </LogOutButtonContainer>
      </TopBar.Right>
    </StyledTopBar>
  );
};
