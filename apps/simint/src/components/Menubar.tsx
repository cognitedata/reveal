import { useState } from 'react';
import { useMatchRoute, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { TopBar } from '@cognite/cogs.js';

import { selectIsLabelsEnabled } from '../store/capabilities/selectors';
import { createCdfLink } from '../utils/createCdfLink';
import { TRACKING_EVENTS } from '../utils/metrics/constants';
import { trackUsage } from '../utils/metrics/tracking';

import { LabelsModal } from './LabelsModal';
import { SimulatorStatus } from './simulator/SimulatorStatus';

export function MenuBar() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const isLabelsEnabled = useSelector(selectIsLabelsEnabled);

  return (
    <div data-cy="top-bar">
      <TopBar>
        {isLabelsEnabled && <LabelsModal isOpen={isOpen} setOpen={setOpen} />}
        <TopBar.Left>
          <TopBar.Navigation
            links={[
              {
                name: 'Model library',
                isActive: !!matchRoute({
                  to: '/simint/model-library',
                  fuzzy: true,
                }),
                onClick: () => {
                  navigate({
                    to: createCdfLink('/model-library'),
                  });
                },
              },
              {
                name: 'Run browser',
                isActive: !!matchRoute({
                  to: '/simint/calculations/runs',
                  fuzzy: true,
                }),
                onClick: () => {
                  trackUsage(TRACKING_EVENTS.RUN_BROWSER_VIEW, {});
                  navigate({
                    to: createCdfLink('/calculations/runs'),
                  });
                },
              },
            ]}
          />
        </TopBar.Left>
        <TopBar.Right>
          <div className="cogs-topbar--item" style={{ padding: '0 24px' }}>
            <SimulatorStatus />
          </div>
        </TopBar.Right>
      </TopBar>
    </div>
  );
}
