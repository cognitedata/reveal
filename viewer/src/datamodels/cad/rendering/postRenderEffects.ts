/*!
 * Copyright 2020 Cognite AS
 */

import { CadNode } from '..';
import * as THREE from 'three';
import { RenderMode } from './RenderMode';

export function addPostRenderEffects(
  cadNode: CadNode,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene
) {
  const currentRenderMode = cadNode.renderMode;

  renderer.clearDepth();
  renderer.autoClearColor = false;
  cadNode.renderMode = RenderMode.Effects;
  renderer.render(scene, camera);
  renderer.autoClearColor = true;
  cadNode.renderMode = currentRenderMode;
}
