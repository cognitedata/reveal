import { useState } from 'react';
import { Link, useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Switch } from '@cognite/cogs.js';
import { Button, Skeleton } from '@cognite/cogs.js-v9';
import {
  useGetModelCalculationQuery,
  useGetModelFileQuery,
} from '@cognite/simconfig-api-sdk/rtk';

import { CalculationSummary } from 'components/calculation/CalculationSummary';
import { Editor } from 'components/shared/Editor';
import { useTitle } from 'hooks/useTitle';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { createCdfLink } from 'utils/createCdfLink';

import type { AppLocationGenerics } from 'routes';

export function CalculationDetails() {
  const [isJsonModeEnabled, setJsonModeEnabled] = useState<boolean>(false);
  const project = useSelector(selectProject);
  const {
    params: {
      modelName,
      simulator = 'UNKNOWN',
      calculationType = 'IPR',
      userDefined,
    },
  } = useMatch<AppLocationGenerics>();
  const { data: modelFile, isFetching: isFetchingModelFile } =
    useGetModelFileQuery({ project, modelName, simulator });
  const { data: modelCalculation, isFetching: isFetchingModelCalculation } =
    useGetModelCalculationQuery({
      project,
      modelName,
      simulator,
      calculationType,
      userDefinedType: userDefined,
    });

  useTitle(
    `${modelCalculation?.configuration.calculationName ?? '...'} / ${
      modelFile?.metadata.modelName ?? '...'
    }`
  );

  if (isFetchingModelFile || isFetchingModelCalculation) {
    return <Skeleton.List lines={5} />;
  }

  if (!modelFile || !modelCalculation) {
    // No model file returned
    throw new Error('Model file or calculation missing');
  }

  const modelLibraryPath = modelCalculation.configuration.calcTypeUserDefined
    ? '../../..'
    : '../..';

  return (
    <CalculationDetailsContainer>
      <h2>
        <strong>{modelCalculation.configuration.calculationName}</strong>
        <span>{modelFile.metadata.modelName}</span>
        <Switch
          checked={isJsonModeEnabled}
          name="json-preview"
          onChange={() => {
            setJsonModeEnabled(!isJsonModeEnabled);
          }}
        >
          <span className="editor-text">JSON Preview</span>
        </Switch>
        <Link to={createCdfLink('configuration')}>
          <Button icon="Settings">Edit configuration</Button>
        </Link>
        <Link to={createCdfLink(modelLibraryPath)}>
          <Button icon="ArrowLeft">Return to model library</Button>
        </Link>
      </h2>
      {!isJsonModeEnabled ? (
        <>
          <ConfigurationMetadata>
            {modelCalculation.configuration.calcTypeUserDefined ? (
              <div className="entry">
                <div>Calculation Type</div>
                <div>{modelCalculation.configuration.calcTypeUserDefined}</div>
              </div>
            ) : null}
            <div className="entry">
              <div>Simulator</div>
              <div>{modelCalculation.configuration.simulator}</div>
            </div>
            {modelCalculation.configuration.unitSystem && (
              <div className="entry">
                <div>Unit system</div>
                <div>{modelCalculation.configuration.unitSystem}</div>
              </div>
            )}
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
          <CalculationSummary configuration={modelCalculation.configuration} />
        </>
      ) : (
        <Editor
          height="75vh"
          value={JSON.stringify(modelCalculation.configuration, null, 2)}
          highlightActiveLine
          readOnly
        />
      )}
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
  span.editor-text {
    font-size: 1rem;
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
