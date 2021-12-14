/*!
 * Copyright 2021 Cognite AS
 */

import { GltfSectorParser, ParsedGeometry } from '@reveal/sector-parser';
import { DynamicDefragmentedBuffer, TypedArray } from '@reveal/utilities';
import * as Comlink from 'comlink';

export class GltfGeometryWorker {
  private readonly _gltfSectorParser = new GltfSectorParser();

  parseSector(buffer: ArrayBuffer): ParsedGeometry[] {
    const parsedSectorGeometry = this._gltfSectorParser.parseSector(buffer);

    const transferables: Transferable[] = parsedSectorGeometry.flatMap(getTransferables);
    return Comlink.transfer(parsedSectorGeometry, transferables);
  }

  batchGeometry(geometry: THREE.BufferGeometry, defragmentedBuffer: DynamicDefragmentedBuffer<Uint8Array>) {
    Comlink.proxy()
  }
}

function getTransferables(parsedGeometry: ParsedGeometry): Transferable[] {
  const transferables = new Set<Transferable>();
  for (const attribute of Object.values(parsedGeometry.geometryBuffer.attributes)) {
    const data = attribute.array as TypedArray;
    transferables.add(data.buffer);
  }
  return Array.from(transferables);
}
