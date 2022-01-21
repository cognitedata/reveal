import { useContext } from 'react';
import { Link } from 'react-location';
import { useSelector } from 'react-redux';

import { Avatar, TopBar } from '@cognite/cogs.js';

import { SimulatorStatus } from 'components/simulator/SimulatorStatus';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { selectProject } from 'store/simconfigApiProperties/selectors';

export function MenuBar() {
  const project = useSelector(selectProject);
  const { authState } = useContext(CdfClientContext);

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          subtitle={<div>{project}</div>}
          title="Cognite Simulator Configuration"
        />
        <nav aria-label="Main" className="cogs-topbar--item__navigation">
          <Link
            className="cogs-btn cogs-btn-secondary cogs-btn--padding navigation-item"
            getActiveProps={() => ({ className: 'active' })}
            role="link"
            to="/model-library"
          >
            Model library
          </Link>
          <Link
            className="cogs-btn cogs-btn-secondary cogs-btn--padding navigation-item"
            getActiveProps={() => ({ className: 'active' })}
            role="link"
            to="/calculations/runs"
          >
            Run browser
          </Link>
        </nav>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Item style={{ padding: '0 24px' }}>
          <SimulatorStatus />
        </TopBar.Item>
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
