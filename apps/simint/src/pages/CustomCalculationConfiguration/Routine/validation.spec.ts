import type {
  CalculationStep,
  StepFields,
} from '@cognite/simconfig-api-sdk/rtk';

import { getStepValidationErrors, isValidStep } from './validation';

const symmetryDynamicStepFields: StepFields = {
  steps: [
    {
      stepType: 'get/set',
      fields: [
        {
          name: 'path',
          label: 'Simulation Object Path',
          info: 'Enter the path of the Symmetry variable, i.e. /Crude_Feed.In.MassFlow',
        },
      ],
    },
    {
      stepType: 'command',
      fields: [
        {
          name: 'type',
          label: 'Command',
          options: [
            { label: 'Pause', value: 'Pause' },
            { label: 'Solve', value: 'Solve' },
          ],
          info: 'Select a command',
        },
      ],
    },
  ],
};

const petroSimDynamicStepFields: StepFields = {
  steps: [
    {
      stepType: 'get/set',
      fields: [
        {
          name: 'objectType',
          label: 'Simulation Object Type',
          info: 'Enter the type of the PetroSIM object, i.e. Material Stream',
        },
        {
          name: 'objectName',
          label: 'Simulation Object Name',
          info: 'Enter the name of the PetroSIM object, i.e. Feed',
        },
        {
          name: 'objectProperty',
          label: 'Simulation Object Property',
          info: 'Enter the property of the PetroSIM object, i.e. Temperature',
        },
      ],
    },
    {
      stepType: 'command',
      fields: [
        {
          name: 'type',
          label: 'Command',
          options: [
            { label: 'Pause Solver', value: 'Pause Solver' },
            { label: 'Solve Flowsheet', value: 'Solve Flowsheet' },
          ],
          info: 'Select a command',
        },
      ],
    },
  ],
};

describe('isValidStep', () => {
  it('returns true for valid Get step', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Get',
      arguments: {
        type: 'outputTimeSeries',
        value: 'SGH',
        path: '/Sales_Gas.In.Fraction.HYDROGEN SULFIDE',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(true);
  });

  it('returns false for Get step missing a dynamic field', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Get',
      arguments: {
        type: 'outputTimeSeries',
        value: 'SGH',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });

  it('returns false for Get step missing a static field', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Get',
      arguments: {
        value: 'SGH',
        path: '/Sales_Gas.In.Fraction.HYDROGEN SULFIDE',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });

  it('returns false for Get step with wrong arguments.type', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Get',
      arguments: {
        type: 'inputTimeSeries',
        value: 'SGH',
        path: '/Sales_Gas.In.Fraction.HYDROGEN SULFIDE',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });

  it('returns true for valid Set step', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Set',
      arguments: {
        type: 'inputTimeSeries',
        value: 'SGH',
        path: '/Sales_Gas.In.Fraction.HYDROGEN SULFIDE',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(true);
  });

  it('returns false for Set step missing a dynamic field', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Set',
      arguments: {
        type: 'inputTimeSeries',
        value: 'SGH',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });

  it('returns false for Set step missing a static field', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Set',
      arguments: {
        value: 'SGH',
        path: '/Sales_Gas.In.Fraction.HYDROGEN SULFIDE',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });

  it('returns false for Set step with wrong arguments.type', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Set',
      arguments: {
        type: 'outputTimeSeries',
        value: 'SGH',
        path: '/Sales_Gas.In.Fraction.HYDROGEN SULFIDE',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });

  it('returns true for valid Command step', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Command',
      arguments: {
        type: 'Pause',
      },
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(true);
  });

  it('returns false for invalid Command step', () => {
    const step: CalculationStep = {
      step: 3,
      type: 'Command',
      arguments: {},
    };

    expect(isValidStep(step, symmetryDynamicStepFields)).toBe(false);
  });
});

describe('getStepValidationErrors', () => {
  it('returns 0 for routine with no errors', () => {
    const values = {
      routine: [
        {
          order: 1,
          description: 'Set Inputs',
          steps: [
            {
              step: 1,
              type: 'Set',
              arguments: {
                type: 'inputTimeSeries',
                value: 'RCLVF',
                objectType: 'Material Stream',
                objectName: 'Raw Crude',
                objectProperty: 'IdealLiquidVolumeFlow',
              },
            },
          ],
        },
      ],
    };

    expect(
      getStepValidationErrors(petroSimDynamicStepFields, values, 'routine')()
    ).toBe(0);
  });

  it('returns 2 for routine with 2 errors', () => {
    const values = {
      routine: [
        {
          order: 1,
          description: 'Set Inputs',
          steps: [
            {
              step: 1,
              type: 'Set',
              arguments: {
                type: 'inputTimeSeries',
                value: 'RCLVF',
                objectType: '',
                objectName: 'Raw Crude',
                objectProperty: 'IdealLiquidVolumeFlow',
              },
            },
            {
              step: 2,
              type: 'Get',
              arguments: {
                type: 'outputTimeSeries',
                value: 'RCLVF',
                objectType: 'Material Stream',
                objectName: '',
                objectProperty: 'IdealLiquidVolumeFlow',
              },
            },
          ],
        },
      ],
    };

    expect(
      getStepValidationErrors(petroSimDynamicStepFields, values, 'routine')()
    ).toBe(2);
  });
});
