/*!
 * Copyright 2023 Cognite AS
 */
import { ParsedGeometry } from '@reveal/sector-parser';
import { TypedArray } from '@reveal/utilities';
import { BufferAttribute, BufferGeometry, InterleavedBufferAttribute } from 'three';
import { DrawCallBatchingManager } from './DrawCallBatchingManager';

export class MultiBufferBatchingManager implements DrawCallBatchingManager {
  public batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void {
    geometryBatchingQueue.forEach(parsedGeometry => {
      if (parsedGeometry.instanceId === undefined) {
        return;
      }
      this.processGeometries(parsedGeometry as Required<ParsedGeometry>, sectorId);
    });
  }
  public removeSectorBatches(sectorId: number): void {
    throw new Error('Method not implemented.');
  }
  public dispose(): void {
    throw new Error('Method not implemented.');
  }

  private processGeometries(parsedGeometry: Required<ParsedGeometry>, sectorId: number) {
    console.log(parsedGeometry.instanceId);
  }

  private getBufferGeometryAttributesStride(bufferGeometry: BufferGeometry): number {
    return Object.values(bufferGeometry.attributes)
      .filter(attribute => attribute instanceof InterleavedBufferAttribute)
      .reduce((cummulativeStride, attribute) => cummulativeStride + getAttributeByteSize(attribute), 0);

    function getAttributeByteSize(attribute: BufferAttribute | InterleavedBufferAttribute): number {
      return attribute.itemSize * (attribute.array as TypedArray).BYTES_PER_ELEMENT;
    }
  }
}
