/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { AxisRenderStyle } from './AxisRenderStyle';
import { AxisDomainObject } from './AxisDomainObject';

describe(AxisDomainObject.name, () => {
  test('should have initial state', () => {
    const domainObject = new AxisDomainObject();
    expect(domainObject.label).toBe('Axis');
    expect(domainObject.icon).toBe('Axis3D');
    expect(domainObject.hasIconColor).toBe(false);
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(domainObject.createRenderStyle()).toBeInstanceOf(AxisRenderStyle);
  });
});
