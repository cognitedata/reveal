import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Icon, TopBar, Menu, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  getGroupsState,
  getUsersGroupNames,
  isAdmin,
} from 'store/groups/selectors';
import { getUserId } from 'store/auth/selectors';
import defaultCustomerLogo from 'images/default_logo.png';
import cogniteLogo from 'images/cognite_logo.png';
import { CustomLink, CustomMenuItem } from 'styles/common';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { logout } from 'utils/logout';
import sidecar from 'utils/sidecar';
import { getReleaseVersion } from 'utils/release';
import { clearGroupsFilter, setGroupsFilter } from 'store/groups/actions';
import { useHistory } from 'react-router-dom';
import { useMetrics } from 'utils/metrics';
import { CUSTOMER_LOGO_ID } from 'constants/cdf';
import * as Sentry from '@sentry/browser';
import { setHttpError } from 'store/notification/thunks';
import { modalOpen } from 'store/modals/actions';
import { getConfigState } from 'store/config/selectors';
import { addConfigItems } from 'store/config/actions';
import CustomerLogo from './CustomerLogo';
import { CogniteLogo, GroupPreview, LogoWrapper } from './elements';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector(isAdmin);
  const email = useSelector(getUserId);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const history = useHistory();
  const metrics = useMetrics('AppHeader');
  const { customerLogoFetched } = useSelector(getConfigState);

  const { privacyPolicyUrl } = sidecar;
  const allGroupNames = useSelector(getUsersGroupNames);

  const client = useContext(CdfClientContext);

  const [customerLogoUrl, setCustomerLogoUrl] = useState('');

  const performLogout = async () => {
    metrics.track('Profile_Logout');
    await logout(client);
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

  useEffect(() => {
    const fetchCustomerLogoUrl = async () => {
      try {
        const { downloadUrl } = (
          await client.getDownloadUrls([CUSTOMER_LOGO_ID])
        )[0];
        setCustomerLogoUrl(downloadUrl);
      } catch (e) {
        setCustomerLogoUrl(defaultCustomerLogo);
        if (e.status !== 400 && e.status !== 403) {
          Sentry.captureException(e);
          dispatch(setHttpError(`Failed to fetch a logo`, e));
        }
      }
    };
    if (!customerLogoFetched) {
      fetchCustomerLogoUrl();
      dispatch(addConfigItems({ customerLogoFetched: true }));
    }
  }, [customerLogoFetched, dispatch, client]);

  const releaseVersion = `Version: ${getReleaseVersion()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(releaseVersion);
  };

  const openUploadLogoModal = () => {
    dispatch(modalOpen({ modalType: 'UploadLogo' }));
  };

  if (!customerLogoFetched) {
    return null;
  }

  const actions = [
    {
      key: 'settings',
      component: (
        <Tooltip content="Settings">
          <Icon
            type="Settings"
            data-testid="select-settings-menu"
            onClick={() => metrics.track('Settings_Click')}
          />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>System admin</Menu.Header>
          <Menu.Item appendIcon="Upload" onClick={() => openUploadLogoModal()}>
            Upload customer logo
          </Menu.Item>
        </Menu>
      ),
    },
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
              // TODO(DTC-348) replace with stable link as soon as it is available
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
              // TODO(DTC-348) replace with stable link as soon as it is available
              href="https://pr-567.docs.preview.cogniteapp.com/cockpit/guides/admins.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => metrics.track('HelpMenu_AdminRole')}
            >
              System Administrator role
            </CustomLink>
          </Menu.Item>
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

  const adminActions = ['view', 'settings'];

  const filteredActions = !admin
    ? actions.filter((action) => !adminActions.includes(action.key))
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
              logo={<CustomerLogo imgUrl={customerLogoUrl} />}
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
