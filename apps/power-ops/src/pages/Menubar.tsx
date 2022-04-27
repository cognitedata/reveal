import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Dropdown, Menu, TopBar } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';
import { PriceArea } from '@cognite/power-ops-api-types';
import { PriceAreasContext } from 'providers/priceAreaProvider';

import {
  StyledTopBar,
  LogoContainer,
  LogOutButtonContainer,
  StyledMenu,
} from './elements';

export enum PAGES {
  HOME = '/home',
  PROCESSES = '/processes',
  MONITORING = '/monitoring',
  PORTFOLIO = '/portfolio',
  LOGOUT = '/logout',
}

export const MenuBar = () => {
  const history = useHistory();
  const [active, setActive] = useState<string>(PAGES.PORTFOLIO);

  const [visible, setVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');

  const { allPriceAreas, priceAreaChanged } = useContext(PriceAreasContext);

  const handleNavigate = (page: PAGES, priceArea?: PriceArea) => {
    if (priceArea) {
      setActive(`${page}/${priceArea.externalId}/total`);
      history.push(`${page}/${priceArea.externalId}/total`);
      priceAreaChanged(priceArea.externalId);
    } else {
      setActive(page);
      history.push(page);
    }
    setVisible(false);
    setSelected(priceArea?.externalId || '');
  };

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  function handleClick() {
    history.push('/logout');
  }

  useEffect(() => {
    // setup initial selection on page load
    // (this is a bit hack perhaps, please modify for your own routes)
    setActive(`/${window.location.pathname.split('/')[2]}`);
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
          <TopBar.Logo title="Cognite Power Markets" />
        </LogoContainer>
        <Dropdown
          visible={visible}
          onClickOutside={() => setVisible(false)}
          content={
            <StyledMenu className="testing">
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
            ]}
          />
        </Dropdown>
      </TopBar.Left>
      <TopBar.Right>
        <LogOutButtonContainer>
          <LogoutButton handleClick={handleClick} />
        </LogOutButtonContainer>
      </TopBar.Right>
    </StyledTopBar>
  );
};
