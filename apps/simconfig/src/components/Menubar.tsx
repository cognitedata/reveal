import { useState } from 'react';
import { useMatchRoute, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Avatar, Button, Menu, TopBar } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';

import { SimulatorStatus } from 'components/simulator/SimulatorStatus';
import { selectCapabilities } from 'store/capabilities/selectors';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { getAuthenticatedUser } from 'utils/authUtils';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

import { LabelsModal } from './LabelsModal';

export function MenuBar() {
  const project = useSelector(selectProject);
  const capabilities = useSelector(selectCapabilities);
  const [isOpen, setOpen] = useState<boolean>(false);
  const { authState } = useAuthContext();
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const labelsFeature = capabilities.capabilities?.find(
    (feature) => feature.name === 'Labels'
  );
  const isLabelsEnabled = labelsFeature?.capabilities?.every(
    (capability) => capability.enabled
  );
  const accountName = authState
    ? getAuthenticatedUser({ project, authState })?.name
    : '(no name)';

  const redirectLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <TopBar data-cy="top-bar">
      {isLabelsEnabled && <LabelsModal isOpen={isOpen} setOpen={setOpen} />}
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
            ...(isLabelsEnabled
              ? [
                  {
                    key: 'settings',
                    component: (
                      <Button
                        icon="Tag"
                        type="ghost"
                        onClick={() => {
                          setOpen(true);
                        }}
                      />
                    ),
                    onClick: () => {
                      trackUsage(TRACKING_EVENTS.NAVBAR_LABELS_CLICK);
                    },
                  },
                ]
              : []),
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
                  <Menu.Item data-cy="logout-button" onClick={redirectLogout}>
                    Logout
                  </Menu.Item>
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
