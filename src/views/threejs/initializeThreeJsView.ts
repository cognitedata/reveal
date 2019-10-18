/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { LoadSectorRequest } from '../../sector/loadSector';
import { Sector, SectorMetadata } from '../../sector/types';
import { buildScene } from './buildScene';
import { SectorNode } from './SectorNode';

export function initializeThreeJsView(sectorRoot: SectorMetadata) {
  const sectorNodeMap = new Map<number, SectorNode>();
  const rootGroup = new SectorNode();
  buildScene(sectorRoot, rootGroup, sectorNodeMap);

  function discardSector(sectorId: number, request: LoadSectorRequest) {
    request.cancel();
    const sectorNode = sectorNodeMap.get(sectorId);
    sectorNode.remove(sectorNode.cube);
    sectorNode.cube = undefined; // TODO override remove?
  }

  function consumeSector(sectorId: number, sector: Sector) {
    const group = sectorNodeMap.get(sectorId);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: '#D33F' + sectorId.toString() + '2' // TODO remove
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = sectorId;
    cube.name = 'Bounding box ' + sectorId.toString();
    group.cube = cube; // TODO override add?
    group.add(cube);
  }

  return { rootGroup, discardSector, consumeSector };
}
