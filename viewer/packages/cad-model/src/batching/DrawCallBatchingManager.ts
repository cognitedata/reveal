/*!
 * Copyright 2023 Cognite AS
 */

import type { ParsedGeometry } from '@reveal/sector-parser';

export interface DrawCallBatchingManager {
  batchGeometries(geometryBatchingQueue: ParsedGeometry[], sectorId: number): void;
  removeSectorBatches(sectorId: number): void;
  /**
   * Rebuilds the compact proxies of all batches. Must be called after node styling has changed.
   * @param options Rebuild options.
   * @param options.batchLayersAreCurrent Set when the render layers of the batch meshes have just been recomputed,
   * to avoid computing them a second time.
   */
  updateCompactProxies(options?: { batchLayersAreCurrent?: boolean }): void;
  setCompactProxiesEnabled(enabled: boolean): void;
  dispose(): void;
}
