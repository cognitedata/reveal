/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { ExampleRenderStyle } from './ExampleRenderStyle';

describe(ExampleRenderStyle.name, () => {
  test('Should be cloned', () => {
    const style = new ExampleRenderStyle();
    const clone = style.clone();
    expect(clone).toStrictEqual(style);
  });
});
