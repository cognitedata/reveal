/*!
 * Copyright 2023 Cognite AS
 */

import type { ParsedGeometry } from '@reveal/sector-parser';

export interface DrawCallBatchingManager {
  batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void;
  removeSectorBatches(sectorId: number): void;
  dispose(): void;
}
