import { Calculation } from '@cognite/calculation-backend';
import { fullListOfOperations } from 'models/calculation-backend/operations/mocks/mocks';
import { validateSteps } from './calculations';

describe('validateSteps', () => {
  it('should reject steps without valid inputs (missing input value - empty string)', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: '' },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(false);
  });

  it('should reject steps without valid inputs (missing input value - null)', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: null },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(false);
  });

  it('should reject steps without valid inputs (missing input value - undefined)', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: undefined },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(false);
  });

  it('should reject steps without valid inputs (too few inputs)', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [{ type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' }],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(false);
  });

  it('should reject steps without valid inputs (too many inputs)', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(false);
  });

  it('should accept steps with valid inputs', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'add',
        version: '1.0',
        inputs: [
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: 'VAL_21_PI_1017_04:Z.X.Value' },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(true);
  });

  it('should accept steps with valid inputs (using old uppercase op style)', () => {
    const steps: Calculation['steps'] = [
      {
        step: 0,
        op: 'ADD',
        version: '1.0',
        inputs: [
          { type: 'ts', value: 'VAL_21_PT_1017_04:Z.X.Value' },
          { type: 'ts', value: 'VAL_21_PI_1017_04:Z.X.Value' },
        ],
        params: {},
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        version: '1.0',
        inputs: [{ type: 'result', value: 0 }],
      },
    ] as Calculation['steps'];

    const isValid = validateSteps(steps, fullListOfOperations);

    expect(isValid).toBe(true);
  });
});
