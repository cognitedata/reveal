/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';

CameraControls.install({ THREE });

async function main() {
  const modelUrl = new URL(location.href).searchParams.get('model') || '/primitives';

  const pickedNodes: number[] = [];
  const shading = reveal_threejs.createDefaultShading({
    color(treeIndex: number) {
      if (pickedNodes.indexOf(treeIndex) !== -1) {
        return [255, 255, 0, 255];
      }
      return undefined;
    }
  });

  const scene = new THREE.Scene();
  const pickingScene = new THREE.Scene();

  // Add some data for Reveal
  const cadModel = await reveal.createLocalCadModel(modelUrl);
  const cadNode = new reveal_threejs.CadNode(cadModel, { shading });

  // TODO We might need to split CadNode up to achieve what we want
  // We probably need to have a shadow scene that uses the same data,
  // but different shading from the original scene.
  // This has the benefit of not having to change the uniforms back and forth as well.
  //
  // We can look into this at the same time as we try to split CadNode into more useful components.
  const pickingCadNode = new reveal_threejs.CadNode(cadModel, { shading });
  scene.add(cadNode);
  pickingScene.add(pickingCadNode);

  // Add some other geometry
  const boxGeometry = new THREE.BoxGeometry(10.0, 4.0, 2.0);
  const boxMaterial = new THREE.MeshPhongMaterial({
    color: 'red',
    emissive: 'rgb(0.2, 0.1, 0.1)'
  });
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  // We add other objects to a group to use only this when raycasting
  const otherGroup = new THREE.Group();
  otherGroup.add(boxMesh);
  scene.add(otherGroup);

  // Add some light for the box
  const light = new THREE.PointLight();
  light.position.set(-10, -10, 10);
  scene.add(light);

  // Set up picking for other objects
  const raycaster = new THREE.Raycaster();

  // Set up the renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#444');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const { position, target, near, far } = cadNode.suggestCameraConfig();
  console.log("CAMERA NEAR FAR", near, far);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);
  const controls = new CameraControls(camera, renderer.domElement);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  let pickingNeedsUpdate = false;
  const clock = new THREE.Clock();
  const render = async () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectorsNeedUpdate = await cadNode.update(camera);

    if (controlsNeedUpdate || sectorsNeedUpdate || pickingNeedsUpdate) {
      renderer.render(scene, camera);
      pickingNeedsUpdate = false;
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
      const intersections = reveal_threejs.intersectCadNodes([cadNode], { renderer, camera, coords });
      if (intersections.length === 0) {
        return;
      }

      return intersections[0];
    })();
    if (revealPickResult) {
      console.log('Reveal', revealPickResult.treeIndex, revealPickResult.distance, revealPickResult.point);
    }

    // Pick other objects
    const otherPickResult = (() => {
      raycaster.setFromCamera(coords, camera);
      const intersectedObjects = raycaster.intersectObjects(otherGroup.children);
      console.log(intersectedObjects);
      if (intersectedObjects.length === 0) {
        return;
      }

      console.log('Other', intersectedObjects[0].distance, intersectedObjects[0].point);

      return intersectedObjects[0];
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

    console.log('CHOSEN', chosenPickResult);

    switch (chosenPickResult) {
      case 'other':
        const mesh = otherPickResult!.object as THREE.Mesh;
        const material = mesh.material as THREE.MeshPhongMaterial;
        material.emissive = new THREE.Color('yellow');
        pickingNeedsUpdate = true;
        break;
      case 'reveal':
        pickedNodes.push(revealPickResult!.treeIndex);
        shading.updateNodes([revealPickResult!.treeIndex]);
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
