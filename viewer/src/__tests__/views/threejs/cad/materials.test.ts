/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials } from '@/datamodels/cad/rendering/materials';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';

describe('createMaterials', () => {
  test('Positive treeIndexCount, creates materials', () => {
    const materials = createMaterials(32, RenderMode.Color, []);
    for (const entry of Object.entries(materials)) {
      expect(entry[1]).not.toBeNull();
    }
  });
});
