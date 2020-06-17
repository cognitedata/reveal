/*!
 * Copyright 2020 Cognite AS
 */

import { CadNode } from '..';
import * as THREE from 'three';
import { RenderMode } from './RenderMode';

export function addPostRenderEffects(
  cadNode: CadNode[],
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene
) {
  const currentRenderModes = cadNode.map(x => x.renderMode);
  cadNode.forEach(x => (x.renderMode = RenderMode.Effects));
  renderer.clearDepth();
  renderer.autoClearColor = false;
  renderer.render(scene, camera);
  renderer.autoClearColor = true;
  cadNode.forEach((x, n) => (x.renderMode = currentRenderModes[n]));
}
