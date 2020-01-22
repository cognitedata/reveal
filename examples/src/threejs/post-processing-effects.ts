/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import { CadNode } from '@cognite/reveal/threejs';
import CameraControls from 'camera-controls';
//import { NormalPass, DepthEffect, BlendFunction, EffectPass, SSAOEffect } from 'postprocessing';

const postprocessing = require('postprocessing');
const { NormalPass, DepthEffect, BlendFunction, EffectPass, SSAOEffect }  = postprocessing;

CameraControls.install({ THREE });

async function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const cadModel = await reveal.createLocalCadModel('/primitives');
  const cadModelNode = new CadNode(cadModel);
  scene.add(cadModelNode);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(100, 100, 100);
  const target = new THREE.Vector3(0, 0, 0);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const normalPass = new NormalPass(scene, camera);

  const depthEffect = new DepthEffect({
    blendFunction: BlendFunction.SKIP
  });

  const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
    blendFunction: BlendFunction.MULTIPLY,
    samples: 11,
    rings: 4,
    distanceThreshold: 0.3, // Render up to a distance of ~300 world units
    distanceFalloff: 0.02, // with an additional 20 units of falloff.
    rangeThreshold: 0.001,
    rangeFalloff: 0.001,
    luminanceInfluence: 0.7,
    radius: 18.25,
    scale: 1.0,
    bias: 0.05
  });

  const effectPass = new EffectPass(camera, ssaoEffect, depthEffect);
  // renderPass.renderToScreen = false;
  effectPass.renderToScreen = true;

  const effectComposer = new postprocessing.EffectComposer(renderer);
  effectComposer.addPass(normalPass);
  effectComposer.addPass(effectPass);

  // See https://vanruesc.github.io/postprocessing/public/docs/identifiers.html
  //const effectPass = new postprocessing.EffectPass(camera, smaaEffect, ssaoEffect, depthEffect);
  //effectPass.renderToScreen = true;
  //const effectComposer = new postprocessing.EffectComposer(renderer);
  //effectComposer.addPass(new postprocessing.RenderPass(scene, camera));
  //effectComposer.addPass(effectPass);

  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const modelNeedsUpdate = await cadModelNode.update(camera);
    const needsUpdate = controlsNeedUpdate || modelNeedsUpdate;

    if (needsUpdate) {
      effectComposer.render(delta);
    }
    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
