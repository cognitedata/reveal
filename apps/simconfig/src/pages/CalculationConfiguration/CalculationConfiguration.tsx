import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Skeleton, toast } from '@cognite/cogs.js';
import type { CalculationType } from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelCalculationQuery,
  useGetModelCalculationTemplateQuery,
  useGetModelFileQuery,
  useUpsertCalculationMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { Wizard } from 'components/shared/Wizard';
import { useTitle } from 'hooks/useTitle';
import { useAppSelector } from 'store/hooks';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { selectSimulators } from 'store/simulator/selectors';

import { AdvancedStep } from './steps/AdvancedStep';
import { DataSamplingStep } from './steps/DataSamplingStep';
import { InputStep } from './steps/InputStep';
import { OutputStep } from './steps/OutputStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { SummaryStep } from './steps/SummaryStep';

import type { AppLocationGenerics } from 'routes';

export function CalculationConfiguration() {
  const project = useSelector(selectProject);
  const {
    params: {
      simulator = 'UNKNOWN',
      modelName,
      calculationType: encodedCalculationType = 'IPR',
    },
    data: { definitions },
  } = useMatch<AppLocationGenerics>();
  const navigate = useNavigate();

  const { data: modelFile, isFetching: isFetchingModelFile } =
    useGetModelFileQuery({ project, modelName, simulator });

  const calculationType = decodeURIComponent(
    encodedCalculationType
  ) as CalculationType;
  const calculationName =
    definitions?.type.calculation[calculationType] ?? 'N/A';

  useTitle(`${calculationName} / ${modelFile?.metadata.modelName ?? '...'}`);

  const simulators = useAppSelector(selectSimulators);
  const simulatorConnector = simulators.find(
    (connectorSimulator) => connectorSimulator.simulator === simulator
  );

  const { data: modelCalculation, isFetching: isFetchingModelConfiguration } =
    useGetModelCalculationQuery({
      project,
      modelName,
      calculationType: encodedCalculationType,
      simulator,
    });

  const {
    data: configurationTemplate,
    isFetching: isFetchingConfigurationTemplate,
  } = useGetModelCalculationTemplateQuery({
    project,
    modelName,
    calculationType: encodedCalculationType,
    simulator,
    connector: simulatorConnector?.name ?? 'unknown',
  });

  const [upsertCalculation] = useUpsertCalculationMutation();

  if (
    isFetchingModelFile ||
    isFetchingConfigurationTemplate ||
    isFetchingModelConfiguration
  ) {
    return <Skeleton.List lines={5} />;
  }

  if (!modelFile || !configurationTemplate) {
    return null;
  }

  if (!simulatorConnector) {
    toast.error(
      'Could not find connector information. Please refresh the page and try again.'
    );
    return null;
  }

  const { dataSet: dataSetId } = simulatorConnector;

  return (
    <CalculationConfigurationContainer>
      <h2>
        <strong>{calculationName}</strong>
        <span>Configuration for {modelFile.metadata.modelName}</span>
        {modelCalculation ? (
          <Link to="..">
            <Button icon="Info">Calculation details</Button>
          </Link>
        ) : null}
        <Link to="../..">
          <Button icon="ArrowLeft">Return to model library</Button>
        </Link>
      </h2>
      <Formik
        initialValues={modelCalculation?.configuration ?? configurationTemplate}
        onSubmit={async (values) => {
          try {
            await upsertCalculation({
              project,
              dataSetId,
              calculationTemplateModel: values,
            }).unwrap();
            toast.success('The calculation was successfully configured.', {
              autoClose: 5000,
            });
            navigate({ to: '../..' });
          } catch (e) {
            toast.error(
              `An error occured while storing the calculation configuration.`
            );
          }
        }}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Wizard
              animated
              onComplete={() => {
                handleSubmit();
              }}
            >
              <Wizard.Step icon="Calendar" key="schedule" title="Schedule">
                <ScheduleStep />
              </Wizard.Step>
              <Wizard.Step
                icon="DataSource"
                key="data-sampling"
                title="Data sampling"
              >
                <DataSamplingStep />
              </Wizard.Step>
              <Wizard.Step
                disabled={!['ChokeDp', 'VLP', 'IPR'].includes(calculationType)}
                icon="Configure"
                key="advanced"
                title="Advanced"
              >
                <AdvancedStep />
              </Wizard.Step>
              <Wizard.Step icon="InputData" key="input" title="Inputs">
                <InputStep />
              </Wizard.Step>
              <Wizard.Step icon="OutputData" key="output" title="Outputs">
                <OutputStep />
              </Wizard.Step>
              <Wizard.Step icon="Checkmark" key="summary" title="Summary">
                <SummaryStep />
              </Wizard.Step>
            </Wizard>
          </Form>
        )}
      </Formik>
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
