import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Dropdown, Icon, Menu, TopBar } from '@cognite/cogs.js';
import { LogoutButton, useAuthContext } from '@cognite/react-container';
import { PriceArea } from '@cognite/power-ops-api-types';
import { PriceAreasContext } from 'providers/priceAreaProvider';
import { handleLogout } from 'utils/utils';
import { PAGES } from 'App';

import {
  StyledTopBar,
  LogoContainer,
  LogOutButtonContainer,
  StyledMenu,
} from './elements';

export const MenuBar = () => {
  const history = useHistory();
  const { authState } = useAuthContext();
  const [active, setActive] = useState<string>(PAGES.PORTFOLIO);

  const [visible, setVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');

  const { allPriceAreas, priceAreaChanged } = useContext(PriceAreasContext);

  const handleNavigate = (path: PAGES, priceArea?: PriceArea) => {
    let page: string = path;
    if (priceArea) {
      page = `${path}/${priceArea.externalId}/total`;
      priceAreaChanged(priceArea.externalId);
    }

    setVisible(false);
    setSelected(priceArea?.externalId || '');
    setActive(page);
    history.push(page);
  };

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    // setup initial selection on page load
    // (this is a bit hack perhaps, please modify for your own routes)
    setActive(`${window.location.pathname.split('/')[2]}`);
    setSelected(`${window.location.pathname.split('/')[3]}`);
    return history.listen((location) => {
      setActive(`${location.pathname}`);
      setSelected(`${location.pathname.split('/')[2]}`);
    });
  }, [history.location]);

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
              {allPriceAreas?.map((pricearea) => (
                <Menu.Item
                  selected={pricearea.externalId === selected}
                  key={pricearea.externalId}
                  onClick={() => handleNavigate(PAGES.PORTFOLIO, pricearea)}
                  appendIcon={
                    pricearea.externalId === selected ? 'Checkmark' : undefined
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
                isActive: active.includes(PAGES.PORTFOLIO),
                onClick: () => toggleDropdown(),
              },
              ...(authState?.email?.includes('@cognite')
                ? [
                    {
                      name: 'Processes',
                      isActive: active === PAGES.PROCESSES,
                      onClick: () => handleNavigate(PAGES.PROCESSES),
                    },
                    {
                      name: 'Monitoring',
                      isActive: active === PAGES.MONITORING,
                      onClick: () => handleNavigate(PAGES.MONITORING),
                    },
                  ]
                : []),
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
