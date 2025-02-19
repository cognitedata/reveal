import { describe, it, expect } from 'vitest';
import { checkBooleanExpressionStatement } from '../../../../../src/components/RuleBasedOutputs/core/checkBooleanExpressionStatement';
import { type Expression } from '../../../../../src/components/RuleBasedOutputs/types';
import { triggerTypeData2 } from '../../../fixtures/ruleBasedOutputs';


describe('checkBooleanExpressionStatement', () => {
  it('should return true for equals condition in fdm', () => {
    const expression: Expression = {
      type: 'booleanExpression',
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-1',
          externalId: 'externalId-2-boolean',
          view: { type: 'view', version: '1', externalId: 'externalId-2', space: 'space-1' },
          typing: {},
          property: 'mockedProperty'
        }
      },
      condition: {
        type: 'equals',
        parameter: true
      }
    };

    const result = checkBooleanExpressionStatement(triggerTypeData2, expression);
    expect(result).toBe(true);
  });

  it('should return false for notEquals condition (fdm)', () => {
    const expression: Expression = {
      type: 'booleanExpression',
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
      condition: {
        type: 'notEquals',
        parameter: false
      }
    };

    const result = checkBooleanExpressionStatement(triggerTypeData2, expression);
    expect(result).toBe(false);
  });

  it('should return undefined if no matching triggerTypeData is found', () => {
    const expression: Expression = {
      type: 'booleanExpression',
      trigger: {
        type: 'fdm',
        key: {
          space: 'space-2',
          externalId: 'externalId-2',
          view: { type: 'view', version: '1', externalId: 'externalId-2', space: 'space-2' },
          typing: {},
          property: 'mockedPropertyNotInTriggerTypeData'
        }
      },
      condition: {
        type: 'equals',
        parameter: true
      }
    };

    const result = checkBooleanExpressionStatement(triggerTypeData2, expression);
    expect(result).toBe(false);
  });
});
