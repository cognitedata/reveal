import React from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Form, Formik, useFormikContext } from 'formik';
import styled from 'styled-components/macro';
import * as Yup from 'yup';

import { Button, Icon, Skeleton, toast } from '@cognite/cogs.js';
import type {
  AggregateType,
  CalculationTemplate,
  CalculationType,
  LengthUnit,
} from '@cognite/simconfig-api-sdk/rtk';
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
import { getScheduleRepeat } from './utils';

import type { AppLocationGenerics } from 'routes';
import type { ObjectSchema, ValidationError } from 'yup';

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

  const isEditing = !!modelCalculation?.configuration;

  return (
    <CalculationConfigurationContainer>
      <h2>
        <strong>{calculationName}</strong>
        <span>Configuration for {modelFile.metadata.modelName}</span>
        {isEditing ? (
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
        validationSchema={CalculationTemplateSchema}
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
        {({ handleSubmit, isValid }) => (
          <Form onSubmit={handleSubmit}>
            <Wizard
              valid={isValid}
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
                <DataSamplingStep isEditing={isEditing} />
              </Wizard.Step>
              <Wizard.Step
                disabled={!['ChokeDp', 'VLP', 'IPR'].includes(calculationType)}
                icon="Configure"
                key="advanced"
                title="Advanced"
              >
                <AdvancedStep isEditing={isEditing} />
              </Wizard.Step>
              <Wizard.Step icon="InputData" key="input" title="Inputs">
                <InputStep isEditing={isEditing} />
              </Wizard.Step>
              <Wizard.Step icon="OutputData" key="output" title="Outputs">
                <OutputStep />
              </Wizard.Step>
              <Wizard.Step icon="Checkmark" key="summary" title="Summary">
                <YupValidationErrors schema={CalculationTemplateSchema} />
                <SummaryStep />
              </Wizard.Step>
            </Wizard>
          </Form>
        )}
      </Formik>
    </CalculationConfigurationContainer>
  );
}

const isYupValidationError = (value?: unknown): value is ValidationError =>
  typeof value === 'object' && value !== null && 'errors' in value;

interface YupValidationErrorsProps {
  schema: ObjectSchema<Record<string, unknown>>;
}

function YupValidationErrors({ schema }: YupValidationErrorsProps) {
  const { values } = useFormikContext<CalculationTemplate>();
  try {
    schema.validateSync(values, {
      abortEarly: false,
    });
    return null;
  } catch (e: unknown) {
    if (!isYupValidationError(e)) {
      return null;
    }
    const { inner } = e;
    return (
      <ValidationErrorContainer>
        <h3>Form validation failed</h3>
        <p>Please correct the following errors before submitting:</p>
        <dl>
          {inner.map(({ path, message, params }) => (
            <React.Fragment key={path}>
              <dt>
                <Icon type="InputData" />
                {(params as { spec?: { label?: string } }).spec?.label ?? path}
              </dt>
              <dd>{message}</dd>
            </React.Fragment>
          ))}
        </dl>
      </ValidationErrorContainer>
    );
  }
}

const ValidationErrorContainer = styled.section`
  background: var(--cogs-bg-status-small--danger);
  color: var(--cogs-text-status-small--danger);
  padding: 8px 12px;
  border-radius: var(--cogs-border-radius--default);
  h3 {
    color: var(--cogs-text-status-small--danger);
  }
  dl {
    margin-left: 12px;
  }
  dt {
    display: inline-flex;
    align-items: center;
    font-weight: bold;
    gap: 8px;
  }
  dd {
    margin-left: 24px;
  }
`;

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

type PresetCalculationTemplateFields =
  | 'calculationName'
  | 'calculationType'
  | 'connector'
  | 'dataModelVersion'
  | 'modelName'
  | 'outputSequences'
  | 'simulator'
  | 'unitSystem'
  | 'userEmail';

const CalculationTemplateSchema: ObjectSchema<
  Omit<CalculationTemplate, PresetCalculationTemplateFields>
> = Yup.object({
  schedule: Yup.object().when(
    'dataSampling.validationWindow',
    ([validationWindow]: number[]) =>
      Yup.object({
        enabled: Yup.boolean().defined(),
        start: Yup.number().defined(),
        repeat: Yup.string()
          .label('Schedule repeat')
          .defined()
          .test(
            'less-than-validation-window',
            `Must be less than validation window (${validationWindow} minutes)`,
            (value) =>
              !!(value && getScheduleRepeat(value).minutes <= validationWindow)
          )
          .test(
            'greater-than-15-minutes',
            'Must be more frequent than 15 minutes',
            (value) => !!(value && getScheduleRepeat(value).minutes >= 15)
          ),
      }).defined()
  ),
  dataSampling: Yup.object({
    validationWindow: Yup.number().defined().label('Validation window').min(15),
    samplingWindow: Yup.number()
      .defined()
      .label('Sampling window')
      .lessThan(
        Yup.ref('validationWindow'),
        'Must be less than validation window'
      )
      .min(0),
    granularity: Yup.number().defined().label('Granularity').min(1),
  }).defined(),
  logicalCheck: Yup.object({
    enabled: Yup.boolean().defined(),
    externalId: Yup.string().defined().label('Logical check time series'),
    aggregateType: Yup.string<AggregateType>(),
    check: Yup.string<'eq' | 'ge' | 'gt' | 'le' | 'lt' | 'ne'>(),
    value: Yup.number().label('Logical check value'),
  }).defined(),
  steadyStateDetection: Yup.object({
    enabled: Yup.boolean().defined(),
    externalId: Yup.string()
      .defined()
      .label('Steady state detection time series'),
    aggregateType: Yup.string<AggregateType>(),
    minSectionSize: Yup.number()
      .defined()
      .label('Min. section size')
      .moreThan(0),
    varThreshold: Yup.number().defined().label('Var threshold').min(0),
    slopeThreshold: Yup.number().defined().label('Slope threshold').lessThan(0),
  }).defined(),
  rootFindingSettings: Yup.object({
    mainSolution: Yup.string<'max' | 'min'>(),
    rootTolerance: Yup.number().label('Root tolerance').moreThan(0),
    bracket: Yup.object({
      lowerBound: Yup.number().label('Lower bound').min(0),
      upperBound: Yup.number()
        .label('Upper bound')
        .moreThan(Yup.ref('lowerBound')),
    }),
  }),
  estimateBHP: Yup.object({
    enabled: Yup.boolean(),
    method: Yup.string<
      'GradientTraverse' | 'LiftCurveGaugeBhp' | 'LiftCurveRate' | 'None'
    >(),
    gaugeDepth: Yup.object({
      value: Yup.number().label('Gauge depth').min(0),
      unit: Yup.string<LengthUnit>(),
      unitType: Yup.string<'Length'>(),
    }),
  }),
  inputTimeSeries: Yup.array().defined(),
  outputTimeSeries: Yup.array().defined(),
});
