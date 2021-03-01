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
import { useIntercom } from 'react-use-intercom';
import { getReleaseVersion } from 'utils/release';
import { clearGroupsFilter, setGroupsFilter } from 'store/groups/actions';
import { useHistory } from 'react-router-dom';
import { useMetrics } from 'utils/metrics';
import { CogniteLogo, GroupPreview, LogoWrapper } from './elements';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector(isAdmin);
  const email = useSelector(getUserId);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const history = useHistory();
  const metrics = useMetrics('AppHeader');

  const { privacyPolicyUrl, intercomTourId } = sidecar;
  const allGroupNames = useSelector(getUsersGroupNames);

  const { startTour, shutdown: shutdownIntercom } = useIntercom();

  const startIntercomTour = () => {
    metrics.track('HelpMenu_StartIntercomTour');
    startTour(intercomTourId);
  };

  const client = useContext(CdfClientContext);

  const performLogout = async () => {
    metrics.track('Profile_Logout');
    await logout(client, shutdownIntercom);
  };

  const setFilter = (groupName: string) => {
    const alreadyChecked = groupsFilter.includes(groupName);
    if (alreadyChecked) {
      dispatch(clearGroupsFilter());
      metrics.track('GroupMenu_UnselectGroup', { groupName });
    } else {
      dispatch(setGroupsFilter([groupName]));
      metrics.track('GroupMenu_SelectGroup', { groupName });
    }
  };
  const clearGroupFilter = () => {
    metrics.track('ClearGroupFilter');
    dispatch(clearGroupsFilter());
  };

  const goHome = () => {
    metrics.track('CustomerLogo_Click');
    history.push('/');
  };

  const releaseVersion = `Version: ${getReleaseVersion()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(releaseVersion);
  };

  const actions = [
    {
      key: 'view',
      component: (
        <Tooltip content="View what other groups has access to">
          <Icon
            type="Public"
            data-testid="select-group-preview-menu"
            onClick={() => metrics.track('GroupMenu_Click')}
          />
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
          <Icon type="Help" onClick={() => metrics.track('HelpMenu_Click')} />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>Cognite documentation</Menu.Header>
          <Menu.Item>
            <CustomLink
              // TODO(DTC-224) replace with stable link as soon as it is available
              href="https://pr-567.docs.preview.cogniteapp.com/cockpit/guides/getstarted.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => metrics.track('HelpMenu_GettingStarted')}
            >
              Learn the basics
            </CustomLink>
          </Menu.Item>
          <Menu.Item>
            <CustomLink
              // TODO(DTC-224) replace with stable link as soon as it is available
              href="https://pr-567.docs.preview.cogniteapp.com/cockpit/guides/admins.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => metrics.track('HelpMenu_AdminRole')}
            >
              System Administrator role
            </CustomLink>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item>
            <CustomMenuItem
              role="button"
              tabIndex={0}
              onClick={startIntercomTour}
              onKeyDown={startIntercomTour}
            >
              Introduction to Digital Cockpit
            </CustomMenuItem>
          </Menu.Item>
        </Menu>
      ),
    },
    {
      key: 'user',
      component: (
        <Avatar
          text={email}
          onClick={() => metrics.track('ProfileMenu_Click')}
        />
      ),
      menu: (
        <Menu>
          <Menu.Item>
            <CustomLink
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => metrics.track('ProfileMenu_PrivacyPolicy')}
            >
              Privacy policy
            </CustomLink>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item disabled>
            <Tooltip content="Click to copy to clipboard">
              <CustomMenuItem onClick={copyToClipboard}>
                {releaseVersion}
              </CustomMenuItem>
            </Tooltip>
          </Menu.Item>
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
              logo={<img src={customerLogo} alt="Digital Twin" />}
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
                onClick={() => metrics.track('CogniteLogo_Click')}
              >
                <img src={cogniteLogo} alt="Cognite" />
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
