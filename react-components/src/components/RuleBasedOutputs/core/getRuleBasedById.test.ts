/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type RuleAndEnabled } from '../types';
import { getRuleBasedById } from './getRuleBasedById';

describe('getRuleBasedById', () => {
  const ruleInstances: RuleAndEnabled[] = [
    {
      rule: {
        properties: {
          id: 'rule-1',
          name: 'Rule 1',
          createdAt: 0,
          createdBy: '',
          rulesWithOutputs: []
        },
        instanceType: 'node',
        version: 0,
        space: '',
        externalId: '',
        createdTime: 0,
        lastUpdatedTime: 0
      },
      isEnabled: true
    },
    {
      rule: {
        properties: {
          id: 'rule-2',
          name: 'Rule 2',
          createdAt: 0,
          createdBy: '',
          rulesWithOutputs: []
        },
        instanceType: 'node',
        version: 0,
        space: '',
        externalId: '',
        createdTime: 0,
        lastUpdatedTime: 0
      },
      isEnabled: false
    }
  ];

  it('should return the rule instance with the given id', () => {
    const result = getRuleBasedById('rule-1', ruleInstances);

    expect(result).toEqual(ruleInstances[0]);
  });

  it('should return undefined if no rule instance with the given id is found', () => {
    const result = getRuleBasedById('rule-3', ruleInstances);

    expect(result).toBeUndefined();
  });

  it('should return undefined if id is undefined', () => {
    const result = getRuleBasedById(undefined, ruleInstances);

    expect(result).toBeUndefined();
  });

  it('should return undefined if ruleInstances is undefined', () => {
    const result = getRuleBasedById('rule-1', undefined);

    expect(result).toBeUndefined();
  });
});
