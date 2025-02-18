/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type Asset } from '@cognite/sdk';
import {
  type FdmTyping,
  type NumericExpression,
  type TriggerTypeData
} from '../../../../../src/components/RuleBasedOutputs/types';
import { checkNumericExpressionStatement } from '../../../../../src/components/RuleBasedOutputs/core/checkNumericExpressionStatement';

describe('checkNumericExpressionStatement', () => {
  const triggerTypeData: TriggerTypeData[] = [
    {
      type: 'fdm',
      instanceNode: {
        items: [
          {
            instanceType: 'node',
            version: 1,
            space: 'space-1',
            externalId: 'externalId-1',
            createdTime: 1212121212,
            lastUpdatedTime: 1212121212,
            properties: {
              'space-1': {
                'externalId-1/1': { mockedProperty: 42 }
              }
            }
          }
        ],
        instanceType: 'node',
        version: 0,
        space: '',
        externalId: '',
        createdTime: 0,
        lastUpdatedTime: 0,
        deletedTime: 0,
        typing: {} satisfies FdmTyping
      }
    },
    {
      type: 'metadata',
      asset: {
        metadata: {
          key1: 'value1',
          key2: 'value2'
        }
      } as unknown as Asset
    },
    {
      type: 'timeseries',
      timeseries: {
        timeseriesWithDatapoints: [
          {
            externalId: 'timeseries-1',
            id: 123,
            isString: false,
            isStep: false,
            description: 'description',
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
            datapoints: [
              {
                value: 55,
                timestamp: new Date()
              },
              {
                value: 60,
                timestamp: new Date()
              },
              {
                value: 65,
                timestamp: new Date()
              },
              {
                value: 70,
                timestamp: new Date()
              },
              {
                value: 75,
                timestamp: new Date()
              },
              {
                value: 80,
                timestamp: new Date()
              },
              {
                value: 85,
                timestamp: new Date()
              },
              {
                value: 90,
                timestamp: new Date()
              },
              {
                value: 95,
                timestamp: new Date()
              },
              {
                value: 100,
                timestamp: new Date()
              }
            ]
          }
        ],
        linkedAssets: {
          rootId: 1,
          name: 'asset-1',
          id: 1,
          lastUpdatedTime: 1212121212,
          createdTime: 1212121212
        } as unknown as Asset
      }
    }
  ];

  it('should return true for equals condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'equals', parameters: [42] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return false for notEquals condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'notEquals', parameters: [42] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(false);
  });

  it('should return true for lessThan condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'lessThan', parameters: [50] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return false for greaterThan condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'greaterThan', parameters: [50] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(false);
  });

  it('should return true for within condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'within', lowerBoundInclusive: 40, upperBoundInclusive: 45 },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return false for outside condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-1',
          view: { type: 'view', version: '1', externalId: 'externalId-1', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: { type: 'outside', lowerBoundExclusive: 30, upperBoundExclusive: 50 },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(false);
  });

  it('should return true for timeseries equals condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'timeseries',
        externalId: 'timeseries-1'
      },
      condition: { type: 'equals', parameters: [100] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return false for timeseries notEquals condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'timeseries',
        externalId: 'timeseries-1'
      },
      condition: { type: 'notEquals', parameters: [100] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(false);
  });

  it('should return false for timeseries lessThan condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'timeseries',
        externalId: 'timeseries-1'
      },
      condition: { type: 'lessThan', parameters: [60] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(false);
  });

  it('should return true for timeseries greaterThan condition', () => {
    const expression: NumericExpression = {
      trigger: {
        type: 'timeseries',
        externalId: 'timeseries-1'
      },
      condition: { type: 'greaterThan', parameters: [60] },
      type: 'numericExpression'
    };

    const result = checkNumericExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });
});
