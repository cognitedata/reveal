import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { formatISO } from 'date-fns';
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
  useGetCalculationRunListQuery,
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
  } = useGetModelCalculationTemplateQuery(
    {
      project,
      modelName,
      calculationType: encodedCalculationType,
      simulator,
      connector: simulatorConnector?.connectorName ?? 'unknown',
    },
    { skip: !simulatorConnector?.connectorName }
  );

  const {
    data: calculationsRunList,
    isFetching: isFetchingCalculationsRunList,
    isLoading: isLoadingCalculationsRunList,
  } = useGetCalculationRunListQuery({
    project,
    modelName,
    simulator,
    calculationType: encodedCalculationType,
    eventEndTime: formatISO(new Date()),
    limit: 1,
  });

  const [upsertCalculation] = useUpsertCalculationMutation();

  const isReadonly =
    isFetchingCalculationsRunList ||
    isLoadingCalculationsRunList ||
    !!calculationsRunList?.calculationRunList.length;
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
    getInputTimeSeries: getInputTimeSeries(
      initialValues.inputTimeSeries,
      modelFile.metadata.modelType
    ),
  });

  const getStepValidationErrors =
    (
      values: Record<string, unknown>,
      ...steps: (
        | 'chokeCurve'
        | 'dataSampling'
        | 'estimateBHP'
        | 'gaugeDepth'
        | 'inputTimeSeries'
        | 'logicalCheck'
        | 'outputTimeSeries'
        | 'rootFindingSettings'
        | 'schedule'
        | 'steadyStateDetection'
      )[]
    ) =>
    () =>
      steps.reduce((sum, step) => {
        try {
          calculationTemplateSchema.validateSyncAt(step, values, {
            abortEarly: false,
          });
        } catch (e) {
          if (!isYupValidationError(e)) {
            return sum;
          }
          return sum + e.errors.length;
        }
        return sum;
      }, 0);

  // Calcuation types with advanced settings
  const calcTypesWtAvcdStps = [
    'ChokeDp',
    'VLP',
    'IPR',
    'BhpFromGradientTraverse',
  ];

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
        validateOnMount
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
        {({ submitForm, isSubmitting, isValid, values, setValues }) => (
          <Form>
            <Wizard
              isSubmitting={isSubmitting}
              isValid={isValid}
              animated
              onCancel={() => {
                navigate({ to: '../..' });
              }}
              onChangeStep={() => {
                const ret = calculationTemplateSchema.cast(
                  values
                ) as CalculationTemplate;
                setValues(ret);
                return true;
              }}
              onSubmit={submitForm}
            >
              <Wizard.Step
                icon="Calendar"
                key="schedule"
                title="Schedule"
                validationErrors={getStepValidationErrors(values, 'schedule')}
              >
                <ScheduleStep />
              </Wizard.Step>
              <Wizard.Step
                icon="DataSource"
                key="data-sampling"
                title="Data sampling"
                validationErrors={getStepValidationErrors(
                  values,
                  'dataSampling',
                  'logicalCheck',
                  'steadyStateDetection'
                )}
              >
                <DataSamplingStep />
              </Wizard.Step>
              <Wizard.Step
                disabled={!calcTypesWtAvcdStps.includes(calculationType)}
                icon="Configure"
                key="advanced"
                title="Advanced"
                validationErrors={getStepValidationErrors(
                  values,
                  'chokeCurve',
                  'estimateBHP',
                  'gaugeDepth',
                  'rootFindingSettings'
                )}
              >
                <AdvancedStep isDisabled={isEditing || isReadonly} />
              </Wizard.Step>
              <Wizard.Step
                icon="InputData"
                key="input"
                title="Inputs"
                validationErrors={getStepValidationErrors(
                  values,
                  'inputTimeSeries'
                )}
              >
                <InputStep isDisabled={isEditing || isReadonly} />
              </Wizard.Step>
              <Wizard.Step
                icon="OutputData"
                key="output"
                title="Outputs"
                validationErrors={getStepValidationErrors(
                  values,
                  'outputTimeSeries'
                )}
              >
                <OutputStep isDisabled={isEditing || isReadonly} />
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
  | 'inputTimeSeries'
  | 'modelName'
  | 'outputSequences'
  | 'outputTimeSeries'
  | 'simulator'
  | 'unitSystem'
  | 'userEmail';

const getInputTimeSeries =
  (validTimeSeries: InputTimeSeries[] = [], modelType = '') =>
  (values: CalculationTemplate) => {
    if (values.calculationType !== 'VLP' && values.calculationType !== 'IPR') {
      return values.inputTimeSeries;
    }

    const isEstimateBHPEnabled = values.estimateBHP.enabled;
    const isGradientTraverse = values.estimateBHP.method === 'GradientTraverse';
    const isLiftCurveGaugeBhp =
      values.estimateBHP.method === 'LiftCurveGaugeBhp';
    const isLiftCurveRate = values.estimateBHP.method === 'LiftCurveRate';

    const isGasWell = modelType === 'GasWell';
    const isRetrogradeWell = modelType === 'RetrogradeWell';
    const isOilWell = modelType === 'OilWell';

    const isInputTimeSeriesEnabled: Partial<
      Record<CalculationType, Partial<Record<TimeSeries['type'], boolean>>>
    > = {
      VLP: {
        BHP: !isEstimateBHPEnabled,
        BHPg:
          isEstimateBHPEnabled && (isGradientTraverse || isLiftCurveGaugeBhp),
        GasRate: isEstimateBHPEnabled && isLiftCurveRate,
        CGR: isGasWell,
        WGR: isGasWell || isRetrogradeWell,
        GOR: isOilWell || isRetrogradeWell,
        OilRate: isEstimateBHPEnabled && isLiftCurveRate && isOilWell,
        WC: isOilWell,
      },
      IPR: {
        BHP: !isEstimateBHPEnabled,
        BHPg:
          isEstimateBHPEnabled && (isGradientTraverse || isLiftCurveGaugeBhp),
        GasRate:
          isEstimateBHPEnabled &&
          isLiftCurveRate &&
          (isGasWell || isRetrogradeWell),
        OilRate: isEstimateBHPEnabled && isLiftCurveRate && isOilWell,
        CGR: isGasWell,
        WGR: isGasWell || isRetrogradeWell,
        GOR: isOilWell || isRetrogradeWell,
        WC: isOilWell,
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
}): ObjectSchema<
  Omit<CalculationTemplate, PresetCalculationTemplateFields>
> => {
  const schedule = Yup.object().when(
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
            `Schedule interval must be greater than or equal to validation window (${validationWindow} minutes)`,
            (value) =>
              !!(value && getScheduleRepeat(value).minutes >= validationWindow)
          )
          .test(
            'greater-than-15-minutes',
            'Schedule interval must be more frequent than 15 minutes',
            (value) => !!(value && getScheduleRepeat(value).minutes >= 15)
          ),
      }).defined()
  );

  const dataSampling = Yup.object({
    validationWindow: Yup.number()
      .defined()
      .label('Validation window')
      .min(15)
      .default(15),
    samplingWindow: Yup.number()
      .defined()
      .label('Sampling window')
      .lessThan(
        Yup.ref('validationWindow'),
        'Sampling window must be less than validation window'
      )
      .min(1)
      .default(1),
    granularity: Yup.number().defined().label('Granularity').min(0).default(1),
    validationEndOffset: Yup.string().defined().label('Validation offset'),
  }).defined();

  const logicalCheck = Yup.object({
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
  });

  const steadyStateDetection = Yup.object({
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
      .min(1),
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
  }).defined();

  const chokeCurve = Yup.object({
    opening: Yup.array().of(Yup.number().min(0).max(100).required().default(0)),
    setting: Yup.array().of(Yup.number().required().default(0)),
  })
    .optional()
    .default(undefined);

  const rootFindingSettings = Yup.object({
    mainSolution: Yup.string<'max' | 'min'>(),
    rootTolerance: Yup.number().label('Root tolerance').moreThan(0),
    bracket: Yup.object({
      lowerBound: Yup.number().label('Lower bound').min(0),
      upperBound: Yup.number()
        .label('Upper bound')
        .moreThan(Yup.ref('lowerBound')),
    }),
  })
    .optional()
    .default(undefined);

  const estimateBHP = Yup.object({
    enabled: Yup.boolean(),
    method: Yup.string<
      'GradientTraverse' | 'LiftCurveGaugeBhp' | 'LiftCurveRate' | 'None'
    >(),
    gaugeDepth: Yup.object({
      value: Yup.number().label('Gauge depth').min(0),
      unit: Yup.string<LengthUnit>(),
      unitType: Yup.string<'Length'>(),
    }),
  })
    .optional()
    .default(undefined);

  const gaugeDepth = Yup.object({
    value: Yup.number().label('Gauge depth').min(0),
    unit: Yup.string<LengthUnit>(),
    unitType: Yup.string<'Length'>(),
  })
    .optional()
    .default(undefined);

  const inputTimeSeries = Yup.array()
    .of(
      Yup.object({
        name: Yup.string<InputTimeSeries['name']>().required().ensure(),
        type: Yup.string<InputTimeSeries['type']>().required().ensure(),
        unit: Yup.string().required().ensure(),
        unitType: Yup.string<InputTimeSeries['unitType']>().required(),
        sensorExternalId: Yup.string().required(),
        aggregateType: Yup.string<AggregateType>().required(),
        sampleExternalId: Yup.string().required(),
      }).required()
    )
    .ensure()
    .defined();

  const outputTimeSeries = Yup.array().ensure().defined();

  return Yup.object({
    schedule,
    dataSampling,
    logicalCheck,
    steadyStateDetection,
    chokeCurve,
    rootFindingSettings,
    estimateBHP,
    gaugeDepth,
    inputTimeSeries,
    outputTimeSeries,
  }).transform((values: CalculationTemplate) => ({
    ...values,
    inputTimeSeries: getInputTimeSeries?.(values),
  }));
};
