/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/experimental';
import { getParamsFromURL, createRenderManager } from './utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';

CameraControls.install({ THREE });

function createSphere(point: THREE.Vector3, color: string): THREE.Mesh {
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshPhongMaterial({ color }));
  sphere.position.copy(point);
  return sphere;
}

async function main() {
  const { project, modelUrl, modelRevision } = getParamsFromURL({ project: 'publicdata', modelUrl: 'primitives' });
  const client = new CogniteClient({ appId: 'reveal.example.picking' });
  client.loginWithOAuth({ project });

  const scene = new THREE.Scene();
  const pickedNodes: Set<number> = new Set();
  const pickedObjects: Set<THREE.Mesh> = new Set();

  const nodeAppearance: reveal.ModelNodeAppearance = {
    color(treeIndex: number) {
      if (pickedNodes.has(treeIndex)) {
        return [255, 255, 0, 255];
      }
      return undefined;
    }
  };

  const revealManager: reveal.RevealManager = createRenderManager(
    modelRevision !== undefined ? 'cdf' : 'local',
    client
  );

  let model: reveal.CadNode;
  if (revealManager instanceof reveal.LocalHostRevealManager && modelUrl !== undefined) {
    model = await revealManager.addModel('cad', modelUrl, nodeAppearance);
  } else if (revealManager instanceof reveal.RevealManager && modelRevision !== undefined) {
    model = await revealManager.addModel('cad', modelRevision, nodeAppearance);
  } else {
    throw new Error('Need to provide either project & model OR modelUrl as query parameters');
  }
  scene.add(model);

  // Set up the renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const { position, target, near, far } = model.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  // Add some other geometry
  const boxGeometry = new THREE.BoxGeometry(10.0, 4.0, 2.0);
  const boxMaterial = new THREE.MeshPhongMaterial({ color: 'red' });

  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(boxMesh);

  // Add some light for the box
  for (const position of [
    [-20, 40, 50],
    [60, 100, -30]
  ]) {
    const light = new THREE.PointLight();
    light.position.set(position[0], position[1], position[2]);
    scene.add(light);
  }

  // Set up picking for other objects
  const raycaster = new THREE.Raycaster();

  let pickingNeedsUpdate = false;
  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      revealManager.update(camera);
    }

    if (controlsNeedUpdate || pickingNeedsUpdate || revealManager.needsRedraw) {
      renderer.render(scene, camera);
      pickingNeedsUpdate = false;
      revealManager.resetRedraw();
    }

    requestAnimationFrame(render);
  };
  render();

  const pick = (event: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const coords = {
      x: ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1,
      y: ((event.clientY - rect.top) / renderer.domElement.clientHeight) * -2 + 1
    };
    // Pick in Reveal
    const revealPickResult = (() => {
      const intersections = reveal.intersectCadNodes([model], { renderer, camera, coords });
      if (intersections.length === 0) {
        return;
      }

      scene.add(createSphere(intersections[0]!.point, 'purple'));

      return intersections[0];
    })();

    // Pick other objects
    const otherPickResult = (() => {
      raycaster.setFromCamera(coords, camera);
      const intersections = raycaster.intersectObjects([boxMesh]);
      if (intersections.length === 0) {
        return;
      }

      scene.add(createSphere(intersections[0]!.point, 'orange'));

      return intersections[0];
    })();

    const chosenPickResult = (() => {
      if (otherPickResult && revealPickResult) {
        if (otherPickResult.distance < revealPickResult.distance) {
          return 'other';
        } else {
          return 'reveal';
        }
      }
      if (otherPickResult) {
        return 'other';
      }
      if (revealPickResult) {
        return 'reveal';
      }
      return 'none';
    })();

    switch (chosenPickResult) {
      case 'other':
        const mesh = otherPickResult!.object as THREE.Mesh;
        const material = mesh.material as THREE.MeshPhongMaterial;
        if (!pickedObjects.has(mesh)) {
          pickedObjects.add(mesh);
          material.emissive = new THREE.Color('yellow');
        } else {
          pickedObjects.delete(mesh);
          material.emissive = new THREE.Color('black');
        }
        pickingNeedsUpdate = true;

        break;
      case 'reveal':
        const treeIndex = revealPickResult!.treeIndex;
        if (!pickedNodes.has(treeIndex)) {
          pickedNodes.add(treeIndex);
        } else {
          pickedNodes.delete(treeIndex);
        }
        model.requestNodeUpdate([treeIndex]);
        pickingNeedsUpdate = true;

        break;
      default:
        break;
    }
  };
  renderer.domElement.addEventListener('mousedown', pick);

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).renderer = renderer;
}

main();
