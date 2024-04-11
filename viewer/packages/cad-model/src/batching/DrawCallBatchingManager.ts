/*!
 * Copyright 2023 Cognite AS
 */

import { ParsedGeometry } from '@reveal/sector-parser';

export type DrawCallBatchingManager = {
  batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void;
  removeSectorBatches(sectorId: number): void;
  dispose(): void;
};
