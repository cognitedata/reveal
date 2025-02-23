/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type FdmPropertyType } from '../../Reveal3DResources/types';
import { getFdmPropertyTrigger } from './getFdmPropertyTrigger';
import { mockedTrigger } from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('getFdmPropertyTrigger', () => {
  it('should return the property value if it exists', () => {
    const fdmPropertyTrigger: FdmPropertyType<unknown> = {
      'space-1': {
        'view-1/1': {
          mockedProperty: 'mockedValue'
        }
      }
    };

    const result = getFdmPropertyTrigger<string>(fdmPropertyTrigger, mockedTrigger);

    expect(result).toBe('mockedValue');
  });

  it('should return undefined if fdmPropertyTrigger is undefined', () => {
    const fdmPropertyTrigger: FdmPropertyType<unknown> | undefined = undefined;

    const result = getFdmPropertyTrigger<string>(fdmPropertyTrigger, mockedTrigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if space does not exist', () => {
    const fdmPropertyTrigger: FdmPropertyType<unknown> = {
      'space-2': {
        'view-1/1': {
          mockedProperty: 'mockedValue'
        }
      }
    };

    const result = getFdmPropertyTrigger<string>(fdmPropertyTrigger, mockedTrigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if view does not exist', () => {
    const fdmPropertyTrigger: FdmPropertyType<unknown> = {
      'space-1': {
        'view-2/1': {
          mockedProperty: 'mockedValue'
        }
      }
    };

    const result = getFdmPropertyTrigger<string>(fdmPropertyTrigger, mockedTrigger);

    expect(result).toBeUndefined();
  });

  it('should return undefined if property does not exist', () => {
    const fdmPropertyTrigger: FdmPropertyType<unknown> = {
      'space-1': {
        'view-1/1': {
          anotherProperty: 'mockedValue'
        }
      }
    };

    const result = getFdmPropertyTrigger<string>(fdmPropertyTrigger, mockedTrigger);

    expect(result).toBeUndefined();
  });
});
