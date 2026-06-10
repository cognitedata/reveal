/*!
 * Copyright 2022 Cognite AS
 */
import type { Matrix4, Scene, Vector3 } from 'three';
import { Group, InstancedMesh } from 'three';
import type { Primitive, PrimitiveName } from '../../../test-utilities/src/primitives';
import { createPrimitiveInterleavedGeometry, getCollectionType } from '../../../test-utilities/src/primitives';
import type { SimpleTestFixtureComponents } from '../../../visual-tests';
import { SimpleVisualTestFixture } from '../../../visual-tests';
import { setConeGeometry } from '../src/reveal-glb-parser/primitiveGeometries';
import { getMaterialsMap } from './testMaterials';

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

    const group = this.initializeGroup(scene);
    const geometry = createPrimitiveInterleavedGeometry(this._primitiveName, this._primitives);
    setConeGeometry(geometry);
    const materials = getMaterialsMap(this._primitives.length);

    const generalCylinderMaterial = materials.get(getCollectionType(this._primitiveName))!;
    const mesh = new InstancedMesh(geometry, generalCylinderMaterial, this._primitives.length);
    mesh.frustumCulled = false;
    mesh.onBeforeRender = () => {
      (generalCylinderMaterial.uniforms.inverseModelMatrix?.value as Matrix4)?.copy(mesh.matrixWorld).invert();
      (generalCylinderMaterial.uniforms.cameraPosition?.value as Vector3)?.copy(camera.position);
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
