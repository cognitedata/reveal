/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials } from '../../../../views/threejs/cad/materials';
import { RenderMode } from '../../../../views/threejs/materials';

describe('createMaterials', () => {
  test('Positive treeIndexCount, creates materials', () => {
    const materials = createMaterials(32, RenderMode.Color, []);
    for (const entry of Object.entries(materials)) {
      expect(entry[1]).not.toBeNull();
    }
  });
});
