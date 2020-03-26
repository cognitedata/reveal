/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials } from '../../../../views/threejs/cad/materials';

describe('createMaterials', () => {
  test('Positive treeIndexCount, creates materials', () => {
    const materials = createMaterials(32);
    for (const entry of Object.entries(materials)) {
      expect(entry[1]).not.toBeNull();
    }
  });
});
