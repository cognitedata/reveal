import * as THREE from 'three';
import { setUnion, setDifference } from './utils/setUtils';

class Sector {}

enum LoadSectorStatus
{
  Awaiting,
  InFlight,
  Cancelled,
  Resolved,
}

type LoadSectorRequest =
{
  promise?: Promise<void>;
  cancelCb: () => void;
  statusCb: () => LoadSectorStatus;
}

function loadSector(sectorId: number, fetchRequest: (sectorId: number) => Promise<ArrayBuffer>, parseSector: (buffer: ArrayBuffer) => Promise<Sector>, receiveSector : (sector: Sector) => void) : LoadSectorRequest  {
  let cancelRequested = false;
  let status = LoadSectorStatus.Awaiting;
  const result = { promise: undefined, cancelCb: () => cancelRequested = true, statusCb: () => status };

  async function loadSectorAsync(): Promise<void> {
    status = LoadSectorStatus.InFlight;

    if (cancelRequested) {
      status = LoadSectorStatus.Cancelled;
      return;
    }
    const data = await fetchRequest(sectorId);
    
    if (cancelRequested) {
      status = LoadSectorStatus.Cancelled;
      return;
    }
    const sector = await parseSector(data);
    if (cancelRequested) {
      status = LoadSectorStatus.Cancelled;
      return;
    }
    status = LoadSectorStatus.Resolved;
    receiveSector(sector);
  }

  result.promise = loadSectorAsync();
  return result;
}

function buildScene(sector: SectorMetadata, parent: THREE.Object3D, sectorNodeMap: Map<number, SectorNode>) {
  const sectorGroup = new SectorNode();
  sectorGroup.name = `Sector ${sector.id}`;
  parent.add(sectorGroup);
  sectorNodeMap.set(sector.id, sectorGroup);
  for (const child of sector.children) {
    buildScene(child, sectorGroup, sectorNodeMap);
  }
}

interface SectorMetadata {
  id: number;
  children: SectorMetadata[];
}

class SectorNode extends THREE.Group {
  cube?: THREE.Mesh;
}

function main() {
  const activeSectorIds = new Set<number>();
  const activeSectorRequests = new Map<number, LoadSectorRequest>();

  const sectorNodeMap = new Map<number, SectorNode>();
  const sectorRoot = fetchSectors();
  const sectorRootGroup = new SectorNode();
  buildScene(sectorRoot, sectorRootGroup, sectorNodeMap);
  
  const scene = new THREE.Scene();
  scene.add(sectorRootGroup);
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

  function receiveSector(sectorId: number, sector: Sector) {
    const group = sectorNodeMap.get(sectorId);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: "#D33F" + sectorId.toString() + "2" // TODO remove
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = sectorId;
    cube.name = "Bounding box " + sectorId.toString();

    group.cube = cube; // TODO override add?
    group.add(cube);
  }

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
        request.cancelCb();
        const sectorNode = sectorNodeMap.get(id);
        sectorNode.remove(sectorNode.cube);
        sectorNode.cube = undefined; // TODO override remove?
      }

      const fetchRequest = (sectorId: number) => new Promise<ArrayBuffer>((resolve, reject) => {
        setTimeout(() => resolve(new ArrayBuffer(0)), Math.random() * 4000);
      }); 
      async function parseSectorData(sectorId: number, data: ArrayBuffer): Promise<Sector> {
        return {};
      }
    
      for (const id of newSectorIds) {
        const request = loadSector(id, fetchRequest, parseSectorData, sector => receiveSector(id, sector));
        activeSectorRequests.set(id, request);
      }

      // requestSectors(newIds);
      // discardSectors(discardedSectors);
    };    
  };
  renderer.domElement.onmouseup = (upEvent) => {
    renderer.domElement.onmousemove = undefined;
  };

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  render();
}

async function determineSectors(camera: THREE.Camera): Promise<Set<number>> {
  let sectors = [];
  for (let i = 0; i < 10; i++) {
    if (i < camera.position.x) {
      sectors.push(i);
    }
  }

  return new Set<number>(sectors);
}

function fetchSectors(): SectorMetadata
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