/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GltfInstancingPlugin, PrimitiveCollection } from './GltfInstancingPlugin';

export default class GltfSectorParser {
  public async parseSector(data: ArrayBuffer) {
    const loader = new GLTFLoader();
    const instancingPlugin = new GltfInstancingPlugin();

    loader.register(parser => {
      instancingPlugin.parser = parser;
      return instancingPlugin;
    });

    return new Promise<[PrimitiveCollection, THREE.BufferGeometry][]>((resolve, _) => {
      loader.parse(data, '', _ => {
        resolve(instancingPlugin.result);
      });
    });
  }
}
