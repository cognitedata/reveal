/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type NodeAppearance } from '@cognite/reveal';
import { createRuleStyling } from './createRuleStyling';
import { Color } from 'three';

describe('createRuleStyling', () => {
  it('should create rule styling with default values and provided appearance', () => {
    const appearance: NodeAppearance = {
      color: new Color(0xff0000),
      renderGhosted: true,
      visible: false
    };

    const result = createRuleStyling(appearance);

    expect(result).toEqual({
      renderGhosted: true,
      visible: false,
      color: new Color(0xff0000)
    });
  });

  it('should create rule styling with default values when appearance is empty', () => {
    const appearance: NodeAppearance = {};

    const result = createRuleStyling(appearance);

    expect(result).toEqual({
      renderGhosted: false,
      visible: true
    });
  });

  it('should override default values with provided appearance', () => {
    const appearance: NodeAppearance = {
      renderGhosted: true,
      visible: false
    };

    const result = createRuleStyling(appearance);

    expect(result).toEqual({
      renderGhosted: true,
      visible: false
    });
  });
});
