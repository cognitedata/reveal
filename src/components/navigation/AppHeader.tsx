import React, { useContext } from 'react';
import { Avatar, Icon, TopBar, Menu, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  getGroupsState,
  getUsersGroupNames,
  isAdmin,
} from 'store/groups/selectors';
import { getUserId } from 'store/auth/selectors';
import isEqual from 'lodash/isEqual';
import customerLogo from 'images/dt_logo.png';
import cogniteLogo from 'images/cognite_logo.png';
import { CustomLink, CustomMenuItem } from 'styles/common';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { logout } from 'utils/logout';
import sidecar from 'utils/sidecar';
import { getReleaseVersion } from 'utils/release';
import { clearGroupsFilter, setGroupsFilter } from 'store/groups/actions';
import { useHistory } from 'react-router-dom';
import { CogniteLogo, GroupPreview, LogoWrapper } from './elements';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector(isAdmin);
  const email = useSelector(getUserId);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const history = useHistory();

  const { privacyPolicyUrl } = sidecar;
  const allGroupNames = useSelector(getUsersGroupNames);

  const client = useContext(CdfClientContext);

  const performLogout = async () => {
    await logout(client);
  };

  const setFilter = (groupName: string) => {
    const alreadyChecked = groupsFilter.includes(groupName);
    if (alreadyChecked) {
      dispatch(clearGroupsFilter());
    } else {
      dispatch(setGroupsFilter([groupName]));
    }
  };
  const clearGroupFilter = () => dispatch(clearGroupsFilter());

  const goHome = () => history.push('/');

  const actions = [
    {
      key: 'view',
      component: (
        <Tooltip content="View what other groups has access to">
          <Icon type="Public" data-testid="select-group-preview-menu" />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>Select Group Access to View:</Menu.Header>
          {allGroupNames.map((groupName) => (
            <Menu.Item
              selected={groupsFilter.includes(groupName)}
              key={groupName}
            >
              <CustomMenuItem
                onClick={() => setFilter(groupName)}
                onKeyPress={() => setFilter(groupName)}
                data-testid={`menu-item-${groupName}`}
              >
                {groupName}
              </CustomMenuItem>
            </Menu.Item>
          ))}
        </Menu>
      ),
    },
    {
      key: 'help',
      component: (
        <Tooltip content="Help">
          <Icon type="Help" />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>Cognite documentation</Menu.Header>
          <Menu.Item>
            <CustomLink
              // TODO(DTC-224) replace with stable link as soon as it is available
              href="https://pr-567.docs.preview.cogniteapp.com/cockpit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Getting Started
            </CustomLink>
          </Menu.Item>
          <Menu.Item>FAQs</Menu.Item>
          <Menu.Divider />
          <Menu.Item disabled>
            <CustomMenuItem role="button">
              Introduction to Digital Cockpit
            </CustomMenuItem>
          </Menu.Item>
        </Menu>
      ),
    },
    {
      key: 'user',
      component: <Avatar text={email} />,
      menu: (
        <Menu>
          <Menu.Item>
            <CustomLink
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy policy
            </CustomLink>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item disabled>Version: {getReleaseVersion()}</Menu.Item>
          <Menu.Divider />
          <Menu.Item>
            <CustomMenuItem
              role="button"
              tabIndex={0}
              onClick={performLogout}
              onKeyPress={performLogout}
            >
              Log out
            </CustomMenuItem>
          </Menu.Item>
        </Menu>
      ),
    },
  ];

  const filteredActions = !admin
    ? actions.filter((action) => !isEqual(action.key, 'view'))
    : actions;

  return (
    <>
      {!!groupsFilter?.length && (
        <GroupPreview data-testid="user-group-preview-bar">
          <TopBar>
            <TopBar.Left>
              <TopBar.Logo
                title={groupsFilter.join(', ')}
                logo={
                  <Icon type="Public" style={{ margin: '6px 8px 0 12px' }} />
                }
              />
            </TopBar.Left>
            <TopBar.Right>
              <TopBar.Action
                icon="Close"
                text="Clear view"
                onClick={clearGroupFilter}
              />
            </TopBar.Right>
          </TopBar>
        </GroupPreview>
      )}
      <TopBar>
        <TopBar.Left>
          <LogoWrapper>
            <TopBar.Logo
              onLogoClick={goHome}
              logo={<img src={customerLogo} alt="Customer logo" />}
            />
          </LogoWrapper>
        </TopBar.Left>
        <TopBar.Right>
          <CogniteLogo>
            <TopBar.Item>
              <a
                href="https://www.cognite.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={cogniteLogo} alt="Cognite logo" />
              </a>
            </TopBar.Item>
          </CogniteLogo>

          <TopBar.Actions actions={filteredActions} />
        </TopBar.Right>
      </TopBar>
    </>
  );
};

export default AppHeader;
