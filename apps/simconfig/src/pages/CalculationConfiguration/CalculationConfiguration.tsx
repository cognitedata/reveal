import { Link, useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Skeleton } from '@cognite/cogs.js';
import type { CalculationType } from '@cognite/simconfig-api-sdk/rtk';
import { useGetModelCalculationTemplateQuery } from '@cognite/simconfig-api-sdk/rtk';

import { Wizard } from 'components/forms/controls';
import { useTitle } from 'hooks/useTitle';
import { selectProject } from 'store/simconfigApiProperties/selectors';

import type { AppLocationGenerics } from 'routes';

export function CalculationConfiguration() {
  const project = useSelector(selectProject);
  const {
    params: {
      simulator = 'UNKNOWN',
      modelName,
      calculationType: encodedCalculationType,
    },
    data: { modelFile, definitions },
  } = useMatch<AppLocationGenerics>();

  const calculationType = decodeURIComponent(
    encodedCalculationType ?? ''
  ) as CalculationType;
  const calculationName =
    definitions?.type.calculation[calculationType] ?? 'N/A';

  useTitle(`${calculationName} / ${modelFile?.metadata.modelName ?? '...'}`);

  const {
    data: configurationTemplate,
    isFetching: isFetchingConfigurationTemplate,
  } = useGetModelCalculationTemplateQuery({
    project,
    modelName,
    calculationType: encodedCalculationType ?? 'IPR',
    simulator,
    connector: 'unknown',
  });

  if (isFetchingConfigurationTemplate) {
    return <Skeleton.List lines={5} />;
  }

  if (!modelFile || !configurationTemplate) {
    return null;
  }

  return (
    <CalculationConfigurationContainer>
      <h2>
        <strong>{calculationName}</strong>
        <span>Configuration for {modelFile.metadata.modelName}</span>
        <Link to="..">
          <Button icon="Info">Calculation details</Button>
        </Link>
        <Link to="../..">
          <Button icon="ArrowLeft">Return to model library</Button>
        </Link>
      </h2>
      <Wizard animated>
        <Wizard.Step icon="Calendar" key="schedule" title="Schedule">
          Schedule
        </Wizard.Step>
        <Wizard.Step
          icon="DataSource"
          key="data-sampling"
          title="Data sampling"
        >
          Data sampling
        </Wizard.Step>
        <Wizard.Step icon="Configure" key="advanced" title="Advanced">
          Advanced config
        </Wizard.Step>
        <Wizard.Step icon="InputData" key="input" title="Inputs">
          Inputs
        </Wizard.Step>
        <Wizard.Step icon="OutputData" key="output" title="Outputs">
          Outputs
        </Wizard.Step>
        <Wizard.Step icon="Checkmark" key="summary" title="Summary">
          Summary
        </Wizard.Step>
      </Wizard>
    </CalculationConfigurationContainer>
  );
}

const CalculationConfigurationContainer = styled.main`
  padding: 24px;
  h2 {
    display: flex;
    align-items: center;
    column-gap: 12px;
    margin-bottom: 24px;
    span:last-of-type {
      flex: 1 1 auto;
    }
  }
`;
