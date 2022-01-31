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
  InputTimeSeries,
  LengthUnit,
  TimeSeries,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  useGetModelCalculationQuery,
  useGetModelCalculationTemplateQuery,
  useGetModelFileQuery,
  useGetSimulatorsListQuery,
  useUpsertCalculationMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { Wizard } from 'components/shared/Wizard';
import { HEARTBEAT_POLL_INTERVAL } from 'components/simulator/constants';
import { useTitle } from 'hooks/useTitle';
import { selectProject } from 'store/simconfigApiProperties/selectors';

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

  const { data: simulatorsList } = useGetSimulatorsListQuery(
    { project },
    { pollingInterval: HEARTBEAT_POLL_INTERVAL }
  );

  const { data: modelFile, isFetching: isFetchingModelFile } =
    useGetModelFileQuery({ project, modelName, simulator });

  const calculationType = decodeURIComponent(
    encodedCalculationType
  ) as CalculationType;
  const calculationName =
    definitions?.type.calculation[calculationType] ?? 'N/A';

  useTitle(`${calculationName} / ${modelFile?.metadata.modelName ?? '...'}`);

  const simulatorConnector = simulatorsList?.simulators?.find(
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
    connector: simulatorConnector?.connectorName ?? 'unknown',
  });

  const [upsertCalculation] = useUpsertCalculationMutation();

  const isEditing = !!modelCalculation?.configuration;
  const initialValues =
    modelCalculation?.configuration ?? configurationTemplate;

  if (
    isFetchingModelFile ||
    isFetchingConfigurationTemplate ||
    isFetchingModelConfiguration
  ) {
    return <Skeleton.List lines={5} />;
  }

  if (!modelFile || !configurationTemplate || !initialValues) {
    return null;
  }

  if (!simulatorConnector) {
    toast.error(
      'Could not find connector information. Please refresh the page and try again.'
    );
    return null;
  }

  const { dataSetId } = simulatorConnector;

  const calculationTemplateSchema = getCalculationTemplateSchema({
    getInputTimeSeries: getInputTimeSeries(initialValues.inputTimeSeries),
  });

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
        initialValues={initialValues}
        validateOnChange={false}
        validationSchema={calculationTemplateSchema}
        validateOnBlur
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
        {({ handleSubmit, isValid, values, setValues }) => (
          <Form onSubmit={handleSubmit}>
            <Wizard
              valid={isValid}
              animated
              onChangeStep={() => {
                const ret = calculationTemplateSchema.cast(
                  values
                ) as CalculationTemplate;
                setValues(ret);
                return true;
              }}
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
                <OutputStep isEditing={isEditing} />
              </Wizard.Step>
              <Wizard.Step icon="Checkmark" key="summary" title="Summary">
                <YupValidationErrors schema={calculationTemplateSchema} />
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
        <ul>
          {inner.map(({ path, message }) => (
            <li key={path}>
              <Icon type="WarningTriangle" />
              {message}
            </li>
          ))}
        </ul>
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
  ul {
    list-style: none;
  }
  li {
    display: flex;
    align-items: center;
    column-gap: 8px;
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

const getInputTimeSeries =
  (validTimeSeries: InputTimeSeries[] = []) =>
  (values: CalculationTemplate) => {
    if (values.calculationType !== 'VLP' && values.calculationType !== 'IPR') {
      return values.inputTimeSeries;
    }

    const isEstimateBHPEnabled = values.estimateBHP.enabled;
    const isGradientTraverse = values.estimateBHP.method === 'GradientTraverse';
    const isLiftCurveGaugeBhp =
      values.estimateBHP.method === 'LiftCurveGaugeBhp';
    const isLiftCurveRate = values.estimateBHP.method === 'LiftCurveRate';

    const isInputTimeSeriesEnabled: Partial<
      Record<CalculationType, Partial<Record<TimeSeries['type'], boolean>>>
    > = {
      VLP: {
        BHP: !isEstimateBHPEnabled,
        BHPg:
          isEstimateBHPEnabled && (isGradientTraverse || isLiftCurveGaugeBhp),
        GasRate: isEstimateBHPEnabled && isLiftCurveRate,
      },
      IPR: {
        BHP: !isEstimateBHPEnabled,
        BHPg:
          isEstimateBHPEnabled && (isGradientTraverse || isLiftCurveGaugeBhp),
        GasRate: isEstimateBHPEnabled && isLiftCurveRate,
        THP: isEstimateBHPEnabled && (isLiftCurveGaugeBhp || isLiftCurveRate),
        THT: isEstimateBHPEnabled && (isLiftCurveGaugeBhp || isLiftCurveRate),
      },
    };

    return validTimeSeries.reduce<InputTimeSeries[]>(
      (filteredInputTimeSeries, inputTimeSeries) => {
        // Create a new input time series array - ensure all required time
        // series fields are present by using the initial values (which
        // includes all valid input time series for this calculation) as
        // fallback entries
        const { type } = inputTimeSeries;
        const isEnabled =
          isInputTimeSeriesEnabled[values.calculationType]?.[type];
        if (isEnabled !== undefined && !isEnabled) {
          return filteredInputTimeSeries;
        }
        return [
          ...filteredInputTimeSeries,
          values.inputTimeSeries.find(
            (existingTimeSeries) => existingTimeSeries.type === type
          ) ?? inputTimeSeries,
        ];
      },
      []
    );
  };

const getCalculationTemplateSchema = ({
  getInputTimeSeries,
}: {
  getInputTimeSeries?: (values: CalculationTemplate) => InputTimeSeries[];
}): ObjectSchema<Omit<CalculationTemplate, PresetCalculationTemplateFields>> =>
  Yup.object({
    schedule: Yup.object().when(
      'dataSampling.validationWindow',
      ([validationWindow]: number[]) =>
        Yup.object({
          enabled: Yup.boolean().defined(),
          start: Yup.number().defined(),
          repeat: Yup.string()
            .label('Schedule interval')
            .defined()
            .test(
              'less-than-validation-window',
              `Schedule interval must be less than validation window (${validationWindow} minutes)`,
              (value) =>
                !!(
                  value && getScheduleRepeat(value).minutes <= validationWindow
                )
            )
            .test(
              'greater-than-15-minutes',
              'Schedule interval must be more frequent than 15 minutes',
              (value) => !!(value && getScheduleRepeat(value).minutes >= 15)
            ),
        }).defined()
    ),
    dataSampling: Yup.object({
      validationWindow: Yup.number()
        .defined()
        .label('Validation window')
        .min(15),
      samplingWindow: Yup.number()
        .defined()
        .label('Sampling window')
        .lessThan(
          Yup.ref('validationWindow'),
          'Sampling window must be less than validation window'
        )
        .min(0),
      granularity: Yup.number().defined().label('Granularity').min(1),
    }).defined(),
    logicalCheck: Yup.object({
      enabled: Yup.boolean().defined(),
      externalId: Yup.string()
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .ensure()
        .label('Logical check time series'),
      aggregateType: Yup.string<AggregateType>()
        .ensure()
        .when('enabled', {
          is: true,
          then: (schema) => schema.required(),
        })
        .label('Logical check sampling method'),
      check: Yup.string<'eq' | 'ge' | 'gt' | 'le' | 'lt' | 'ne'>()
        .ensure()
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .label('Logical check'),
      value: Yup.number()
        .default(0)
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .label('Logical check value'),
    }),
    steadyStateDetection: Yup.object({
      enabled: Yup.boolean().defined(),
      externalId: Yup.string()
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .ensure()
        .label('Steady state detection time series'),
      aggregateType: Yup.string<AggregateType>()
        .when('enabled', {
          is: true,
          then: (schema) => schema.required(),
        })
        .ensure()
        .label('Steady state detection sampling method'),
      minSectionSize: Yup.number()
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .defined()
        .label('Min. section size')
        .moreThan(0),
      varThreshold: Yup.number()
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .defined()
        .label('Var threshold')
        .min(0),
      slopeThreshold: Yup.number()
        .when('enabled', { is: true, then: (schema) => schema.required() })
        .defined()
        .label('Slope threshold')
        .lessThan(0),
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
    inputTimeSeries: Yup.array().ensure().defined(),
    outputTimeSeries: Yup.array().ensure().defined(),
  }).transform((values: CalculationTemplate) => ({
    ...values,
    inputTimeSeries: getInputTimeSeries?.(values),
  }));
