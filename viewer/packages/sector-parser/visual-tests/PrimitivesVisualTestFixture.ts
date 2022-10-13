/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import {
  createPrimitiveInterleavedGeometry,
  getCollectionType,
  Primitive,
  PrimitiveName
} from '../../../test-utilities/src/primitives';
import { SimpleTestFixtureComponents, SimpleVisualTestFixture } from '../../../visual-tests';
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
    const mesh = new THREE.InstancedMesh(geometry, generalCylinderMaterial, this._primitives.length);
    mesh.frustumCulled = false;
    mesh.onBeforeRender = () => {
      (generalCylinderMaterial.uniforms.inverseModelMatrix?.value as THREE.Matrix4)?.copy(mesh.matrixWorld).invert();
      (generalCylinderMaterial.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);
    };

    group.add(mesh);

    camera.position.set(0, 0, -3);
    camera.lookAt(0, 0, 0);

    return Promise.resolve();
  }

  private initializeGroup(scene: THREE.Scene) {
    const group = new THREE.Group();
    group.frustumCulled = false;
    group.applyMatrix4(this.cadFromCdfToThreeMatrix);
    scene.add(group);
    return group;
  }
}
