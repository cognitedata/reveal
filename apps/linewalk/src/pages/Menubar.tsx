import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Dropdown, TopBar, Menu, Button } from '@cognite/cogs.js';
import capitalize from 'lodash/capitalize';

import SiteContext from '../components/SiteContext/SiteContext';

export const PagePath = {
  LINE_REVIEWS: '/lineReviews',
  LINE_REVIEW: '/lineReview/:id',
  DIAGRAM_PARSER: '/diagramParser',
};

export const MenuBar = () => {
  const history = useHistory();
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const { site, setSite, setUnit, availableSites } = useContext(SiteContext);

  const handleNavigate = (page: string) => () => {
    history.replace({
      ...history.location,
      pathname: page,
    });
  };

  const onMenuItemPress = (availableSite: string): void => {
    setSite(availableSite);
    setUnit('');
    setIsMenuVisible(false);
  };

  const activePathName = `/${window.location.pathname.split('/')[2]}`;

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          title="Cognite LineWalk"
          onLogoClick={() => {
            setIsMenuVisible((wasMenuVisible) => !wasMenuVisible);
          }}
          subtitle={
            <Dropdown
              visible={isMenuVisible}
              content={
                <Menu style={{ width: '200px' }}>
                  {availableSites.map((availableSite) => (
                    <Menu.Item
                      key={availableSite}
                      onClick={() => onMenuItemPress(availableSite)}
                      appendIcon={
                        availableSite === site ? 'Checkmark' : undefined
                      }
                    >
                      {capitalize(availableSite)}
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button
                type="ghost"
                variant="ghost"
                size="small"
                onClick={() => setIsMenuVisible((v) => !v)}
                iconPlacement="right"
                icon="ChevronDown"
              >
                {capitalize(site)}{' '}
              </Button>
            </Dropdown>
          }
        />
      </TopBar.Left>
      <TopBar.Navigation
        links={[
          {
            name: 'Line reviews',
            isActive: activePathName === PagePath.LINE_REVIEWS,
            onClick: handleNavigate(PagePath.LINE_REVIEWS),
          },
          {
            name: 'Diagram Parser',
            isActive: activePathName === PagePath.DIAGRAM_PARSER,
            onClick: handleNavigate(PagePath.DIAGRAM_PARSER),
          },
        ]}
      />
    </TopBar>
  );
};
