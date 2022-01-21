import { useContext } from 'react';
import { useMatchRoute, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Avatar, TopBar } from '@cognite/cogs.js';

import { SimulatorStatus } from 'components/simulator/SimulatorStatus';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { selectProject } from 'store/simconfigApiProperties/selectors';

export function MenuBar() {
  const project = useSelector(selectProject);
  const { authState } = useContext(CdfClientContext);
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          subtitle={<div>{project}</div>}
          title="Cognite Simulator Configuration"
        />
        <TopBar.Navigation
          links={[
            {
              name: 'Model library',
              isActive: !!matchRoute({ to: 'model-library' }),
              onClick: () => {
                navigate({ to: '/model-library' });
              },
            },
            {
              name: 'Run browser',
              isActive: !!matchRoute({ to: 'calculations/runs' }),
              onClick: () => {
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
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
}
