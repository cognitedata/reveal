import { useState } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Collapse } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';
import { useGetDefinitionsQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from '../../store/simconfigApiProperties/selectors';

import { SimulatorInformation } from './SimulatorInformation';
import { SimulatorStatusLabel } from './SimulatorStatusLabel';

export function SimulatorList({
  simulators,
}: {
  simulators?: SimulatorInstance[];
}) {
  const [activeKey, setActiveKey] = useState(simulators?.[0]?.connectorName);
  const project = useSelector(selectProject);

  const { data } = useGetDefinitionsQuery({
    project,
  });

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
                <span className="simulator">
                  {
                    data?.simulatorsConfig?.filter(
                      ({ key }) => key === simulator.simulator
                    )?.[0].name
                  }
                </span>
                <span className="connector">{simulator.connectorName}</span>
                <SimulatorStatusLabel
                  simulator={simulator}
                  title={simulator.simulator}
                  onMenuBar={false}
                />
              </div>
            }
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
  max-height: 375px;
  overflow: auto;
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
