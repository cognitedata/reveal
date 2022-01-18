import { Link, useMatch } from 'react-location';

import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import { useTitle } from 'hooks/useTitle';

import CalculationDetailsDataSection from './CalculationDetailsDataSection';

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
      <CalculationDetailsDataSection
        configuration={modelCalculation.configuration}
      />
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

const ConfigurationMetadata = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  .entry {
    div:nth-child(1) {
      font-weight: bold;
    }
  }
`;
