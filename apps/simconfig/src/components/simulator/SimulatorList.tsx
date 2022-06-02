import { useState } from 'react';

import styled from 'styled-components/macro';

import { Collapse } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { SimulatorInformation } from './SimulatorInformation';
import { SimulatorStatusLabel } from './SimulatorStatusLabel';

export function SimulatorList({
  simulators,
}: {
  simulators?: SimulatorInstance[];
}) {
  const [activeKey, setActiveKey] = useState(simulators?.[0]?.connectorName);

  if (!simulators?.length) {
    return null;
  }

  return (
    <SimulatorListContainer>
      <Collapse
        activeKey={activeKey}
        accordion
        ghost
        onChange={(key) => {
          setActiveKey(key);
        }}
      >
        {simulators.map((simulator, index) => (
          <Collapse.Panel
            header={
              <div
                className="simulator-header"
                id={`simulator-header-${index}`}
              >
                <span className="simulator">{simulator.simulator}</span>
                <span className="connector">{simulator.connectorName}</span>
                <SimulatorStatusLabel
                  simulator={simulator}
                  title={simulator.simulator}
                  onMenuBar={false}
                />
              </div>
            }
            // eslint-disable-next-line react/no-array-index-key
            key={`${
              simulator.connectorName ?? Math.random()
            }-simulator-list-entry-collapse`}
          >
            <SimulatorInformation
              // eslint-disable-next-line react/no-array-index-key
              key={`simulator-info-${index}`}
              simulatorInstance={simulator}
            />
          </Collapse.Panel>
        ))}
      </Collapse>
    </SimulatorListContainer>
  );
}

export const SimulatorListContainer = styled.div`
  min-width: 480px;
  .simulator-header {
    display: flex;
    width: 100%;
    column-gap: 6px;
    .simulator {
      font-weight: bold;
      flex: 1 1 auto;
    }
    .connector {
      color: var(--text-color-secondary);
    }
  }
`;
