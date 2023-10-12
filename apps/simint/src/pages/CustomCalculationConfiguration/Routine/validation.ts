import * as Yup from 'yup-v1';
import type { ValidationError } from 'yup-v1';

import type {
  AggregateType,
  CalculationStep,
  StepFields,
  InputTimeSeries,
} from '@cognite/simconfig-api-sdk/rtk';

import { getScheduleRepeat } from '../../../pages/CalculationConfiguration/utils';

import { StepInputType } from './Commands/Fields/InputType';

type ValueOf<T> = T[keyof T];
type StepTypes = ValueOf<Pick<CalculationStep, 'type'>>;

const isYupValidationError = (value?: unknown): value is ValidationError =>
  typeof value === 'object' && value !== null && 'errors' in value;

const stepMap = {
  Set: {
    type: Yup.string()
      .oneOf([StepInputType.InputTimeSeries, StepInputType.InputConstant])
      .required(),
    value: Yup.string().required(),
  },
  Get: {
    type: Yup.string().oneOf(['outputTimeSeries']).required(),
    value: Yup.string().required(),
  },
  Command: {},
};

const getStepSchema = (dynamicStepFields: StepFields) => {
  return Yup.object({
    step: Yup.number().required().positive().integer(),
    type: Yup.string().oneOf(['Set', 'Get', 'Command']).required(),
    arguments: Yup.object().when('type', ([type]) => {
      const staticFieldRules = stepMap[type as StepTypes];

      const commandKey =
        type === 'Get' || type === 'Set' ? 'get/set' : 'command';
      const stepType = dynamicStepFields?.steps.find(
        (step) => step.stepType === commandKey
      );
      const dynamicFields = stepType?.fields ?? [];

      const dynamicFieldRules = dynamicFields.reduce((acc, field) => {
        acc[field.name] = Yup.string().required();
        return acc;
      }, {} as Record<string, Yup.StringSchema>);

      return Yup.object({
        ...staticFieldRules,
        ...dynamicFieldRules,
      });
    }),
  });
};

export const getGroupSchema = (dynamicStepFields: StepFields) => {
  const stepSchema = getStepSchema(dynamicStepFields);

  return Yup.object({
    order: Yup.number().required().positive().integer(),
    description: Yup.string().required(),
    steps: Yup.array().of(stepSchema).ensure().defined(),
  });
};

export const getRoutine = (dynamicStepFields: StepFields) => {
  const groupSchema = getGroupSchema(dynamicStepFields);

  return Yup.array().of(groupSchema).ensure().defined();
};

export const isValidStep = (
  step: CalculationStep,
  dynamicStepFields: StepFields
) => {
  try {
    const stepSchema = getStepSchema(dynamicStepFields);
    const _validate = stepSchema.validateSync(step);
    return true;
  } catch (e) {
    return false;
  }
};

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

export const getUserDefinedCalculationSchema = (
  dynamicStepFields: StepFields
) => {
  const routine = getRoutine(dynamicStepFields);

  return Yup.object({
    schedule,
    dataSampling,
    logicalCheck,
    steadyStateDetection,
    routine,
    inputTimeSeries,
    outputTimeSeries,
  });
};

export const getStepValidationErrors =
  (
    dynamicStepFields: StepFields,
    values: Record<string, unknown>,
    ...steps: (
      | 'dataSampling'
      | 'inputTimeSeries'
      | 'logicalCheck'
      | 'outputTimeSeries'
      | 'routine'
      | 'schedule'
      | 'steadyStateDetection'
    )[]
  ) =>
  () =>
    steps.reduce((sum, step) => {
      try {
        const userDefinedCalculationSchema =
          getUserDefinedCalculationSchema(dynamicStepFields);

        userDefinedCalculationSchema.validateSyncAt(step, values, {
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
