import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';
import * as THREE from 'three';

async function doFunnyButtonThing(viewer: Cognite3DViewer<DataSourceType>) {
  const speedFactor = 0.8;

  const ballGeom = new THREE.SphereGeometry(2);
  const ballMat = new THREE.MeshBasicMaterial({ color: 'red' });
  const ballMesh = new THREE.Mesh(ballGeom, ballMat);
  viewer.addObject3D(ballMesh);

  const camState = viewer.cameraManager.getCameraState();
  ballMesh.position.copy(camState.position);

  const clock = new THREE.Clock(true);
  clock.start();

  const animateBall = () => {
    clock.getElapsedTime();

    const movementVec = camState.target.clone().sub(camState.position).normalize();
    ballMesh.position.add(movementVec.multiplyScalar(speedFactor));

    viewer.requestRedraw();

    if (clock.elapsedTime >= 7) {
      viewer.removeObject3D(ballMesh);
      viewer.off('sceneRendered', animateBall);
    }
  };

  viewer.on('sceneRendered', animateBall);
}

export function createFunnyButton(viewer: Cognite3DViewer<DataSourceType>) {
  const funnyButton = document.createElement('button');
  funnyButton.innerText = 'Funny button';
  funnyButton.onclick = () => {
    doFunnyButtonThing(viewer);
  };
  funnyButton.style.cssText = `
    position: absolute;
    bottom: -300px;
    width: 30vw;
    height: 10vw;
    left: 35vw;
    border-radius: 8px;
    font-size: 3vw;
    font-family: 'Courier New', Courier, monospace;
  `;
  return funnyButton;
}
