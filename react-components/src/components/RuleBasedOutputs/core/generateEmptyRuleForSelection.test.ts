/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type EmptyRuleForSelection } from '../types';
import { generateEmptyRuleForSelection } from './generateEmptyRuleForSelection';

describe('generateEmptyRuleForSelection', () => {
  it('should generate an empty rule for selection with the given name', () => {
    const name = 'Test Rule';
    const expected: EmptyRuleForSelection = {
      rule: {
        properties: {
          id: undefined,
          name,
          isNoSelection: true
        }
      },
      isEnabled: false
    };

    const result = generateEmptyRuleForSelection(name);

    expect(result).toEqual(expected);
  });
});
