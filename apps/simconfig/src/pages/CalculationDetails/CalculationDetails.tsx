import { Link, useMatch } from 'react-location';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import { Button, Label } from '@cognite/cogs.js';

import { useTitle } from 'hooks/useTitle';

import type { AppLocationGenerics } from 'routes';

export function CalculationDetails() {
  const {
    data: { modelFile, modelCalculation },
  } = useMatch<AppLocationGenerics>();

  useTitle(
    `${modelCalculation?.configuration.calculationName ?? '...'} / ${
      modelFile?.metadata.modelName ?? '...'
    }`
  );

  if (!modelFile || !modelCalculation) {
    // No model file returned
    throw new Error('Model file or calculation missing');
  }

  return (
    <CalculationDetailsContainer>
      <h2>
        <strong>{modelCalculation.configuration.calculationName}</strong>
        <span>{modelFile.metadata.modelName}</span>
        <Link to="configuration">
          <Button icon="Settings">Edit configuration</Button>
        </Link>
        <Link to="../..">
          <Button icon="ArrowLeft">Return to model library</Button>
        </Link>
      </h2>
      <ConfigurationMetadata>
        <div className="entry">
          <div>Simulator</div>
          <div>{modelCalculation.configuration.simulator}</div>
        </div>
        <div className="entry">
          <div>Unit system</div>
          <div>{modelCalculation.configuration.unitSystem}</div>
        </div>
        <div className="entry">
          <div>Model name</div>
          <div>{modelCalculation.configuration.modelName}</div>
        </div>
        <div className="entry">
          <div>User e-mail</div>
          <div>{modelCalculation.configuration.userEmail}</div>
        </div>
        <div className="entry">
          <div>Connector</div>
          <div>{modelCalculation.configuration.connector}</div>
        </div>
      </ConfigurationMetadata>
      <ConfigurationData>
        <ConfigurationDataSection
          // TODO(SIM-209) Refactor out to separate component
          className={classNames({
            enabled: modelCalculation.configuration.schedule.enabled,
            disabled: !modelCalculation.configuration.schedule.enabled,
          })}
        >
          <h3>
            Schedule{' '}
            {modelCalculation.configuration.schedule.enabled || (
              <Label size="small" variant="danger">
                disabled
              </Label>
            )}
          </h3>
          <div className="properties">
            <div className="entry">
              <div>Start</div>
              <div>{modelCalculation.configuration.schedule.start}</div>
            </div>
            <div className="entry">
              <div>Repeat</div>
              <div>{modelCalculation.configuration.schedule.repeat}</div>
            </div>
          </div>
        </ConfigurationDataSection>
      </ConfigurationData>
      {/* <pre>{JSON.stringify(modelCalculation, null, 2)}</pre> */}
    </CalculationDetailsContainer>
  );
}

const CalculationDetailsContainer = styled.main`
  padding: 24px;
  h2 {
    display: flex;
    align-items: center;
    column-gap: 12px;
    span:last-of-type {
      flex: 1 1 auto;
    }
  }
`;

const ConfigurationData = styled.div``;

const ConfigurationDataSection = styled.div`
  h3 {
    margin-top: 24px;
  }
  &.disabled .properties {
    opacity: 0.5;
  }
  .properties {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    .entry {
      div:nth-child(1) {
        font-weight: bold;
      }
    }
  }
`;

const ConfigurationMetadata = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  .entry {
    div:nth-child(1) {
      font-weight: bold;
    }
  }
`;
