import * as THREE from 'three';
import { determineSectors } from './sector/determineSectors';
import { initializeThreeJsView } from './views/threejs/initializeThreeJsView';
import { initializeSectorLoader } from './sector/initializeSectorLoader';

function main() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 4;
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#000000");
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild(renderer.domElement);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: "#433F81"
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  const render = function () {
    requestAnimationFrame( render );
  
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  
    renderer.render(scene, camera);
  };

  const sectorRoot = fetchSectorMetadata();
  const { rootGroup, discardSector, consumeSector } = initializeThreeJsView(sectorRoot);
  const activateSectors = initializeSectorLoader(discardSector, consumeSector);
  scene.add(rootGroup);

  renderer.domElement.onmousedown = (downEvent) => {
    const {x0, y0} = { x0: downEvent.x, y0: downEvent.y };
    renderer.domElement.onmousemove = async (moveEvent) => {
      const { dx, dy } = { dx: moveEvent.x - x0, dy: moveEvent.y - y0 };
      camera.position.x = dx / 100;
      camera.position.y = dy / 100;
      
      const wantedSectorIds = await determineSectors(camera);
      activateSectors(wantedSectorIds);
    };    
  };
  renderer.domElement.onmouseup = (upEvent) => {
    renderer.domElement.onmousemove = undefined;
  };

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  render();
}

function fetchSectorMetadata(): SectorMetadata
{
  return { id: 0, children : [
    { id: 1, children: [ 
      { id: 3, children: []},
      { id: 4, children: []}
    ]},
    { id: 2, children: [
      { id: 5, children: [] }
    ]},
    { id: 6, children: [
      { id: 7, children: [] },
      { id: 8, children: [] },
      { id: 9, children: [] }
    ]}
  ]};
}


main();