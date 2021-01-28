import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Icon, TopBar, Menu, Tooltip } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { isAdmin } from 'store/groups/selectors';
import { getUserId } from 'store/auth/selectors';
import isEqual from 'lodash/isEqual';
import customerLogo from 'images/dt_logo.png';
import cogniteLogo from 'images/cognite_logo.png';
import { CustomLink, CustomMenuItem } from 'styles/common';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { logout } from 'utils/logout';
import sidecar from 'utils/sidecar';
import { useIntercom } from 'react-use-intercom';
import { CogniteLogo, LogoWrapper } from './elements';

const AppHeader: React.FC = () => {
  const admin = useSelector(isAdmin);
  const email = useSelector(getUserId);
  const { privacyPolicyUrl, intercomTourId } = sidecar;

  const {
    startTour,
    show: showIntercomChat,
    shutdown: shutdownIntercom,
  } = useIntercom();

  const startIntercomTour = () => {
    startTour(intercomTourId);
  };

  const handleOnSupportClick = () => {
    showIntercomChat();
  };
  const client = useContext(CdfClientContext);

  const performLogout = async () => {
    await logout(client, shutdownIntercom);
  };

  const actions = [
    {
      key: 'view',
      component: (
        <Tooltip content="View what other groups has access to">
          <Icon type="Public" />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>Select Group Access to View:</Menu.Header>
          <Menu.Item>Operations Control Managers</Menu.Item>
          <Menu.Item>Testing team</Menu.Item>
          <Menu.Item>Management team</Menu.Item>
        </Menu>
      ),
    },
    {
      key: 'feedback',
      component: (
        <Tooltip content="Support">
          <Icon type="Feedback" />
        </Tooltip>
      ),
      onClick: handleOnSupportClick,
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
    <TopBar>
      <TopBar.Left>
        <LogoWrapper>
          <Link to="/">
            <TopBar.Logo
              logo={<img src={customerLogo} alt="Customer logo" />}
            />
          </Link>
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
  );
};

export default AppHeader;
