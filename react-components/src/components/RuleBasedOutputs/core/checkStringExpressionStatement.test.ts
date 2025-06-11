/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type FdmTyping, type StringExpression, type TriggerTypeData } from '../types';
import { type Asset } from '@cognite/sdk';
import { checkStringExpressionStatement } from './checkStringExpressionStatement';

describe('checkStringExpressionStatement', () => {
  const triggerTypeData: TriggerTypeData[] = [
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
      type: 'fdm',
      instanceNode: {
        items: [
          {
            instanceType: 'node',
            version: 1,
            space: 'someSpace',
            externalId: 'someExternalId',
            createdTime: 11121212121,
            lastUpdatedTime: 12121212121,
            properties: {
              key1: { value: 'value1' },
              key2: { value: 'value2' }
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
    }
  ];

  it('should return true for equals condition', () => {
    const expression: StringExpression = {
      type: 'stringExpression',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'equals', parameter: 'value1' }
    };
    const result = checkStringExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return false for notEquals condition', () => {
    const expression: StringExpression = {
      type: 'stringExpression',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'notEquals', parameter: 'value1' }
    };
    const result = checkStringExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(false);
  });

  it('should return true for contains condition', () => {
    const expression: StringExpression = {
      type: 'stringExpression',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'contains', parameter: 'value' }
    };
    const result = checkStringExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return true for startsWith condition', () => {
    const expression: StringExpression = {
      type: 'stringExpression',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'startsWith', parameter: 'val' }
    };
    const result = checkStringExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });

  it('should return true for endsWith condition', () => {
    const expression: StringExpression = {
      type: 'stringExpression',
      trigger: { type: 'metadata', key: 'key1' },
      condition: { type: 'endsWith', parameter: '1' }
    };
    const result = checkStringExpressionStatement(triggerTypeData, expression);
    expect(result).toBe(true);
  });
});
