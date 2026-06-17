/*!
 * Copyright 2026 Cognite AS
 */

import type { Matrix4, Material, Scene, Vector3 } from 'three';
import { Group, InstancedMesh } from 'three';

import type { Primitive, PrimitiveName } from '../../../test-utilities/src/primitives';
import { createPrimitiveInterleavedGeometry, getCollectionType } from '../../../test-utilities/src/primitives';
import type { SimpleTestFixtureComponents } from '../../../visual-tests';
import { SimpleVisualTestFixture } from '../../../visual-tests';
import { getTestRendererKind } from '../../../visual-tests/test-fixtures/testRendererKind';
import { setCameraPosition, setInverseModelMatrix } from '../../../packages/rendering/src/tsl/CadSharedUniforms';
import type { CadNodeMaterial } from '../../../packages/rendering/src/tsl/CadNodeMaterial';
import { setConeGeometry } from '../src/reveal-glb-parser/primitiveGeometries';
import { getMaterialsMapForBackend } from './testMaterials';

export abstract class PrimitivesVisualTestFixture extends SimpleVisualTestFixture {
  private readonly _primitives: Primitive[];
  private readonly _primitiveName: PrimitiveName;
  constructor(primitiveName: PrimitiveName, primitives: Primitive[]) {
    super();
    this._primitiveName = primitiveName;
    this._primitives = primitives;
  }
  public setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void> {
    const { camera, scene } = simpleTestFixtureComponents;
    const backend = getTestRendererKind();

    const group = this.initializeGroup(scene);
    const geometry = createPrimitiveInterleavedGeometry(this._primitiveName, this._primitives);
    setConeGeometry(geometry);
    const materials = getMaterialsMapForBackend(this._primitives.length, backend);

    const primitiveMaterial = materials.get(getCollectionType(this._primitiveName))!;
    const mesh = new InstancedMesh(geometry, primitiveMaterial, this._primitives.length);
    mesh.frustumCulled = false;
    mesh.onBeforeRender = () => {
      if ('sharedUniforms' in primitiveMaterial) {
        setInverseModelMatrix((primitiveMaterial as CadNodeMaterial).sharedUniforms, mesh.matrixWorld.clone().invert());
        setCameraPosition((primitiveMaterial as CadNodeMaterial).sharedUniforms, camera.position);
      } else {
        (primitiveMaterial as Material & { uniforms?: { inverseModelMatrix?: { value: Matrix4 }; cameraPosition?: { value: Vector3 } } }).uniforms?.inverseModelMatrix?.value.copy(mesh.matrixWorld).invert();
        (primitiveMaterial as Material & { uniforms?: { cameraPosition?: { value: Vector3 } } }).uniforms?.cameraPosition?.value.copy(camera.position);
      }
    };

    group.add(mesh);

    camera.position.set(0, 0, -3);
    camera.lookAt(0, 0, 0);

    return Promise.resolve();
  }

  private initializeGroup(scene: Scene) {
    const group = new Group();
    group.frustumCulled = false;
    group.applyMatrix4(this.cadFromCdfToThreeMatrix);
    scene.add(group);
    return group;
  }
}
