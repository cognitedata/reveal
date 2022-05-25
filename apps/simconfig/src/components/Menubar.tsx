import { useMatchRoute, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Avatar, Menu, TopBar } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';

import { SimulatorStatus } from 'components/simulator/SimulatorStatus';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { getAuthenticatedUser } from 'utils/authUtils';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

export function MenuBar() {
  const project = useSelector(selectProject);
  const { authState } = useAuthContext();
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const accountName = authState
    ? getAuthenticatedUser({ project, authState })?.name
    : '(no name)';

  const redirectLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          subtitle={<div id="project-name">{project}</div>}
          title="Cognite Simulator Configuration"
        />
        <TopBar.Navigation
          links={[
            {
              name: 'Model library',
              isActive: !!matchRoute({ to: '/model-library/*' }),
              onClick: () => {
                navigate({ to: '/model-library' });
              },
            },
            {
              name: 'Run browser',
              isActive: !!matchRoute({ to: 'calculations/runs' }),
              onClick: () => {
                trackUsage(TRACKING_EVENTS.RUN_BROWSER_VIEW, {});
                navigate({ to: '/calculations/runs' });
              },
            },
          ]}
        />
      </TopBar.Left>
      <TopBar.Right>
        <div className="cogs-topbar--item" style={{ padding: '0 24px' }}>
          <SimulatorStatus />
        </div>
        <TopBar.Actions
          actions={[
            {
              key: 'avatar',
              component: (
                <Avatar text={authState?.email ?? 'unknown@example.org'} />
              ),
              menu: (
                <Menu>
                  {accountName && (
                    <>
                      <Menu.Item style={{ color: 'inherit' }} disabled>
                        {accountName}
                      </Menu.Item>
                      <Menu.Divider />
                    </>
                  )}
                  <Menu.Item onClick={redirectLogout}>Logout</Menu.Item>
                </Menu>
              ),
              onClick: () => {
                trackUsage(TRACKING_EVENTS.PROFILE_AVATAR_CLICK);
              },
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
}
