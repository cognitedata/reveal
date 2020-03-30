/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata } from '../..';
import { traverseDepthFirst } from '../../utils/traversal';
import { SectorModelTransformation } from '../../models/cad/types';
import { toThreeJsBox3, toThreeMatrix4 } from './utilities';
import { Box3 } from '../../utils/Box3';
import { coverageShaders } from './cad/shaders';

type SectorContainer = {
  sectorIdOffset: number;
  renderable: THREE.Object3D;
};

const boxTemplateGeometry = (() => {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position')
  };
  geometry.dispose();
  return result;
})();

const coverageMaterial = new THREE.ShaderMaterial({
  // uniforms?: any;
  vertexShader: coverageShaders.vertex,
  fragmentShader: coverageShaders.fragment
});

export class OrderSectorsByVisibleCoverage {
  private sectorIdOffset = 0;
  private readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly roots = new Map<SectorMetadata, SectorContainer>();

  constructor(renderer?: THREE.WebGLRenderer) {
    this.renderer =
      renderer || new THREE.WebGLRenderer({ antialias: false, alpha: false, precision: 'lowp', stencil: false });
  }

  addSectorTree(root: SectorMetadata, modelTransformation: SectorModelTransformation) {
    const mesh = this.createSectorTreeMesh(root, modelTransformation);
    this.roots.set(root, {
      sectorIdOffset: this.sectorIdOffset,
      renderable: mesh
    });
    this.scene.add(mesh);
  }

  render(camera: THREE.Camera, alreadyLoadedSectors?: any[] /* not sure what this is yet */) {
    this.renderer.render(this.scene, camera);
  }

  private createSectorTreeMesh(root: SectorMetadata, modelTransformation: SectorModelTransformation): THREE.Object3D {
    const group = new THREE.Group();
    group.applyMatrix4(toThreeMatrix4(modelTransformation.modelMatrix));
    const bbox = toThreeJsBox3(new THREE.Box3(), root.bounds);
    group.add(new THREE.Box3Helper(bbox));
    // return group;

    let sectorCount: number = 0;
    traverseDepthFirst(root, () => {
      sectorCount++;
      return true;
    });

    const elementsPerSector = 3 + 3 + 1 + 1; // Translation, scale, sectorId and coverage factor
    const buffer = new Float32Array(elementsPerSector * sectorCount);
    const bufferIdx = 0;

    const addSector = (sectorBounds: Box3, sectorId: number, coverageFactor: number) => {
      const bounds = toThreeJsBox3(new THREE.Box3(), sectorBounds /*, modelTransformation*/);
      const translation = bounds.getCenter(new THREE.Vector3()); // .multiplyScalar(-1.0);
      const scale = bounds.getSize(new THREE.Vector3());
      group.add(new THREE.Box3Helper(bounds, new THREE.Color('red')));

      buffer[elementsPerSector + bufferIdx + 0] = translation.x;
      buffer[elementsPerSector + bufferIdx + 1] = translation.y;
      buffer[elementsPerSector + bufferIdx + 2] = translation.z;
      buffer[elementsPerSector + bufferIdx + 3] = scale.x;
      buffer[elementsPerSector + bufferIdx + 4] = scale.y;
      buffer[elementsPerSector + bufferIdx + 5] = scale.z;
      buffer[elementsPerSector * bufferIdx + 6] = sectorId;
      buffer[elementsPerSector * bufferIdx + 7] = coverageFactor;
    };

    traverseDepthFirst(root, sector => {
      const coverageFactor =
        (sector.facesFile.coverageFactors.xy +
          sector.facesFile.coverageFactors.xz +
          sector.facesFile.coverageFactors.yz) /
        3.0;
      addSector(sector.bounds, sector.id, coverageFactor);
      return true;
    });

    const interleavedBuffer = new THREE.InterleavedBuffer(buffer, elementsPerSector);
    const translationAtt = new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false);
    const scaleAtt = new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 3, false);
    const coverageFactorAtt = new THREE.InterleavedBufferAttribute(interleavedBuffer, 1, 6, false);

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setIndex(boxTemplateGeometry.index);
    geometry.setAttribute('position', boxTemplateGeometry.position);
    geometry.setAttribute('a_translation', translationAtt);
    geometry.setAttribute('a_scale', scaleAtt);
    geometry.setAttribute('a_coverageFactor', coverageFactorAtt);
    const mesh = new THREE.InstancedMesh(new THREE.BoxBufferGeometry(), coverageMaterial, sectorCount);
    group.add(mesh);

    return group;
  }
}
