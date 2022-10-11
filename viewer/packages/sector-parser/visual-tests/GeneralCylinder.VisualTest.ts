/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import {
  createPrimitiveInterleavedGeometry,
  GeneralCylinder,
  PrimitiveName
} from '../../../test-utilities/src/primitives';
import { SimpleTestFixtureComponents, SimpleVisualTestFixture } from '../../../visual-tests';
import { setConeGeometry } from '../src/reveal-glb-parser/primitiveGeometries';
import { RevealGeometryCollectionType } from '../src/types';
import { getMaterialsMap } from './testMaterials';

export default class GeneralCylinderVisualTest extends SimpleVisualTestFixture {
  public setup(simpleTestFixtureComponents: SimpleTestFixtureComponents): Promise<void> {
    const { camera, scene } = simpleTestFixtureComponents;

    const generalCylinderDescriptor = {
      treeIndex: 0,
      color: [0, 0, 0, 1],
      centerA: [0, 0, 1.4663076400756836],
      centerB: [0, 0, -1],
      radius: 0.2,
      planeA: [0.4161977469921112, 0.07338689267635345, 0.9063078165054321, 2],
      planeB: [0, 0, -1, 0],
      localXAxis: [1, 0, 0],
      angle: 0,
      arcAngle: Math.PI * 2
    } as GeneralCylinder;

    const group = this.initializeGroup(scene);
    const geometry = createPrimitiveInterleavedGeometry(PrimitiveName.GeneralCylinder, [generalCylinderDescriptor]);
    setConeGeometry(geometry);
    const materials = getMaterialsMap(1);

    const generalCylinderMaterial = materials.get(RevealGeometryCollectionType.GeneralCylinderCollection)!;
    const mesh = new THREE.Mesh(geometry, generalCylinderMaterial);
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
