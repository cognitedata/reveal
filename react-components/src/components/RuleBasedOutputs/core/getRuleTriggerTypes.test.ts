/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import { type TriggerType, type RuleWithOutputs } from '../types';
import { getRuleTriggerTypes } from './getRuleTriggerTypes';
import {
  mockedExpressionAssetMappingNumericTimeseries,
  mockedExpressionAssetMappingString1,
  mockedExpressionFdmMappingDatetime
} from '../../../../tests/tests-utilities/fixtures/ruleBasedOutputs';

describe('getRuleTriggerTypes', () => {
  it('should return metadata trigger type if rule expression is defined', () => {
    const ruleWithOutput: RuleWithOutputs = {
      rule: {
        expression: mockedExpressionAssetMappingString1,
        type: 'rule',
        id: '',
        name: ''
      },
      outputs: []
    };
    const expectedTriggerTypes: TriggerType[] = ['metadata'];

    const result = getRuleTriggerTypes(ruleWithOutput);

    expect(result).toEqual(expectedTriggerTypes);
  });

  it('should return fdm trigger type if rule expression is defined', () => {
    const ruleWithOutput: RuleWithOutputs = {
      rule: {
        expression: mockedExpressionFdmMappingDatetime,
        type: 'rule',
        id: '',
        name: ''
      },
      outputs: []
    };
    const expectedTriggerTypes: TriggerType[] = ['fdm'];

    const result = getRuleTriggerTypes(ruleWithOutput);

    expect(result).toEqual(expectedTriggerTypes);
  });

  it('should return time series trigger type if rule expression is defined', () => {
    const ruleWithOutput: RuleWithOutputs = {
      rule: {
        expression: mockedExpressionAssetMappingNumericTimeseries,
        type: 'rule',
        id: '',
        name: ''
      },
      outputs: []
    };
    const expectedTriggerTypes: TriggerType[] = ['timeseries'];

    const result = getRuleTriggerTypes(ruleWithOutput);

    expect(result).toEqual(expectedTriggerTypes);
  });

  it('should return undefined if rule expression is undefined', () => {
    const ruleWithOutput: RuleWithOutputs = {
      rule: {
        expression: undefined,
        type: 'rule',
        id: '',
        name: ''
      },
      outputs: []
    };

    const result = getRuleTriggerTypes(ruleWithOutput);

    expect(result).toBeUndefined();
  });
});
