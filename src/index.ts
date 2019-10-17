import * as THREE from 'three';
import { setUnion, setDifference } from './utils/setUtils';
import { loadSector, LoadSectorRequest } from './sector/loadSector';
import { fetchRequest } from './sector/fetchSector';
import { parseSectorData } from './sector/parseSectorData';
import { determineSectors } from './sector/determineSectors';
import { initializeThreeJsView } from './views/threejs/initializeThreeJsView';

function main() {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, LoadSectorRequest>();

  const sectorRoot = fetchSectorMetadata();
  const { rootGroup, discardSector, consumeSector } = initializeThreeJsView(sectorRoot);

  const scene = new THREE.Scene();
  scene.add(rootGroup);
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

  renderer.domElement.onmousedown = (downEvent) => {
    const {x0, y0} = { x0: downEvent.x, y0: downEvent.y };
    renderer.domElement.onmousemove = async (moveEvent) => {
      const { dx, dy } = { dx: moveEvent.x - x0, dy: moveEvent.y - y0 };
      camera.position.x = dx / 100;
      camera.position.y = dy / 100;
      
      const wantedSectorIds = await determineSectors(camera);
      const activeOrInFlight = setUnion(activeSectorIds, new Set<number>(activeSectorRequests.keys()));
      const newSectorIds = setDifference(wantedSectorIds, activeOrInFlight);
      const discardedSectorIds = setDifference(activeOrInFlight, wantedSectorIds);
      console.log("Wanted", wantedSectorIds);
      console.log("Discarded", discardedSectorIds);
      console.log("New", newSectorIds);

      for (const id of discardedSectorIds) {
        const request = activeSectorRequests.get(id);
        activeSectorRequests.delete(id);
        discardSector(id, request);
      }

      for (const id of newSectorIds) {
        const consumeSectorAndDeleteRequest = (sector) => {
          activeSectorRequests.delete(id);
          consumeSector(id, sector);
        };

        const request = loadSector(id, fetchRequest, parseSectorData, consumeSectorAndDeleteRequest);
        activeSectorRequests.set(id, request);
      }
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