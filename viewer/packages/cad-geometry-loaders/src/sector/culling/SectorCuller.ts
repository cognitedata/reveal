/*!
 * Copyright 2021 Cognite AS
 */

import { WantedSector } from '@reveal/cad-parsers';
import { DetermineSectorsInput, SectorLoadingSpent } from './types';

/**
 * Interface for implementations that are responsible for determining
 * what sectors should be loaded (i.e. "culls" sectors).
 */
export interface SectorCuller {
  /**
   * Determine initial sector prioritization about what we think to load. This provides an initial guesstimate of
   * what sectors we should load. Use {@link filterSectorsToLoad} to improve this estimate as new data is loaded.
   * @param input
   */
  determineSectors(input: DetermineSectorsInput): {
    wantedSectors: WantedSector[];
    spentBudget: SectorLoadingSpent;
  };

  /**
   * Evaluates if sectors provided should be loaded or not, e.g. based on geometry we have now loaded
   * since {@link determineSectors} was called. This can be used to e.g. implement pre-load occlusion culling
   * of sectors based on geometry that has been loaded.
   *
   * @param input Same input as used in {@link determineSectors}.
   * @param wantedSectorsBatch A set of sectors from {@link determineSectors}, e.g. in batches of 5-10.
   */
  filterSectorsToLoad(input: DetermineSectorsInput, wantedSectorsBatch: WantedSector[]): Promise<WantedSector[]>;

  /**
   * Dispose all non-GCed resoures held.
   */
  dispose(): void;
}
