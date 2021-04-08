import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Icon, TopBar, Menu, Tooltip, Graphic } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  getGroupsState,
  getUsersGroupNames,
  isAdmin,
} from 'store/groups/selectors';
import { getUserId } from 'store/auth/selectors';
import defaultCustomerLogo from 'images/default_logo.png';
import { CustomMenuItem } from 'styles/common';
import { usePossibleTenant } from 'hooks';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { clearGroupsFilter, setGroupsFilter } from 'store/groups/actions';
import { useHistory } from 'react-router-dom';
import { useMetrics } from 'utils/metrics';
import { CUSTOMER_LOGO_ID } from 'constants/cdf';
import * as Sentry from '@sentry/browser';
import { setHttpError } from 'store/notification/thunks';
import { modalOpen } from 'store/modals/actions';
import { getConfigState } from 'store/config/selectors';
import { addConfigItems } from 'store/config/actions';
import useHelpCenter from 'hooks/useHelpCenter';
import CustomerLogo from './CustomerLogo';
import { GroupPreview, LogoWrapper, GroupItemWrapper } from './elements';
import UserMenu from './UserMenu';
import HelpCenterTooltip from './HelpCenter/HelpCenterTooltip';

const AppHeader: React.FC = () => {
  const dispatch = useDispatch();
  const admin = useSelector(isAdmin);
  const email = useSelector(getUserId);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const history = useHistory();
  const metrics = useMetrics('AppHeader');
  const { customerLogoFetched } = useSelector(getConfigState);
  const allGroupNames = useSelector(getUsersGroupNames);
  const tenant = usePossibleTenant();

  const client = useContext(CdfClientContext);
  const [customerLogoUrl, setCustomerLogoUrl] = useState('');
  const { toggleHelpCenter } = useHelpCenter();

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

  const openUploadLogoModal = () => {
    dispatch(modalOpen({ modalType: 'UploadLogo' }));
  };

  if (!customerLogoFetched) {
    return null;
  }

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
          <Menu.Header>Select Group Access to View</Menu.Header>
          <GroupItemWrapper>
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
                {groupsFilter.includes(groupName) && <Icon type="Check" />}
              </Menu.Item>
            ))}
          </GroupItemWrapper>
          <Menu.Header>Edit Access Groups</Menu.Header>
          <Menu.Item
            key="cogniteDataFusion"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            {/* Update link to the correct one */}
            <a href="/" key="cdf-link" target="_blank">
              Cognite Data Fusion
            </a>
            <Icon type="ExternalLink" />
          </Menu.Item>
        </Menu>
      ),
    },
    {
      key: 'help',
      onClick: toggleHelpCenter,
      component: <HelpCenterTooltip />,
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
        <UserMenu
          email={email}
          client={client}
          openUploadLogoModal={openUploadLogoModal}
        />
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
          <TopBar.Logo
            title="Cognite Solutions Portal"
            logo={
              <Graphic
                type="Cognite"
                style={{
                  width: 42,
                  margin: '4px 12px 0 12px',
                  cursor: 'pointer',
                }}
                className="topbar-logo"
                onClick={goHome}
              />
            }
            subtitle={
              <span style={{ textTransform: 'capitalize' }}>{tenant}</span>
            }
            onLogoClick={goHome}
          />
        </TopBar.Left>
        <TopBar.Right>
          <TopBar.Item>
            <LogoWrapper>
              <TopBar.Logo
                onLogoClick={goHome}
                logo={<CustomerLogo imgUrl={customerLogoUrl} />}
              />
            </LogoWrapper>
          </TopBar.Item>
          <TopBar.Actions actions={filteredActions} />
        </TopBar.Right>
      </TopBar>
    </>
  );
};

export default AppHeader;
