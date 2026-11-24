/*!
 * Copyright 2026 Cognite AS
 */
import { forEachMaterial } from '@reveal/rendering';
import { createCadModel } from '../../../../test-utilities';
import { getModelIndexUniforms } from '../../../../test-utilities/src/cadPickTestUtils';
import { assignModelIndices } from './assignModelIndices';

describe(assignModelIndices.name, () => {
  test('gives each model its position in the list as model index', () => {
    const cadNodes = [createCadModel(3, 4).cadNode, createCadModel(3, 4).cadNode];

    assignModelIndices(cadNodes);

    expect(getModelIndexUniforms(cadNodes[0]).every(modelIndex => modelIndex === 0)).toBe(true);
    expect(getModelIndexUniforms(cadNodes[1]).every(modelIndex => modelIndex === 1)).toBe(true);
  });

  test('throws when a material has no model index uniform', () => {
    const cadNode = createCadModel(3, 4).cadNode;
    forEachMaterial(cadNode.cadMaterial.materials, material => {
      delete material.uniforms.modelIndex;
    });

    expect(() => assignModelIndices([cadNode])).toThrow('CAD material has no modelIndex uniform');
  });
});
