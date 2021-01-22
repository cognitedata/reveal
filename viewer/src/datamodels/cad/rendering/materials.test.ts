/*!
 * Copyright 2021 Cognite AS
 */

import { createMaterials } from './materials';
import { RenderMode } from './RenderMode';

describe('createMaterials', () => {
  test('Positive treeIndexCount, creates materials', () => {
    const materials = createMaterials(32, RenderMode.Color, []);
    for (const entry of Object.entries(materials)) {
      expect(entry[1]).not.toBeNull();
    }
  });
});
