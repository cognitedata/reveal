/*!
 * Copyright 2020 Cognite AS
 */

import { yieldProcessing } from './__tests__/wait';

interface Sector {
  readonly modelId: any;
  readonly sectorId: number;
  readonly lodLevel: 'high' | 'low';
}

class CadSectorLoader {
  private readonly loadState: CadSectorsState;
  private readonly currentBatch: number;

  constructor() {
    this.loadState = new CadSectorState();
  }
  /**
   * @returns A promise that is resolved when/if all sectors
   * provided has been loaded and is "active". The promise is
   * rejected if the operation is cancelled (e.g. setWantedSectors
   * is called again).
   */
  async loadSectors(wanted: Sector[]): Promise<boolean> {
    const { batchId } = this.loadState.setWantedSectors(wanted);

    const downloader = new CadSectorFetcher(this.loadState.pendingSectors);
    const activator = new CadSectorActivator(this.loadState);

    while (batchId === this.loadState.currentBatchId && this.loadState.activeSectors !== state.wantedSectors) {
      await this.loadState.notifySectorsInflight(downloader.takeNewInflightSectors());
      this.loadState.notifySectorsLoaded(downloader.takeNewlyDownloaded());

      const { deactivable, activable } = activator.determineActivatable();
      await yieldUntillRenderedFrame(); // Wait untill right after a render frame

      // Update active set (this will cause loaded sectors to be visible)
      this.loadState.deactivateAndUnloadSectors(deactivable);
      this.loadState.activateSectors(activable);

      await yieldProcessing(); // Let other tasks process before processing the next batch
    }

    // Resolve or reject promise

    // Unsolved issues:
    // 1. Inflight requests from batch N are ignored in later batches
    // Solution: State class must also hold info
    // 2. Unclear how to throttle processing during camera movement
    // 3. Unclear how to throttle number of sectors being uploaded
    //    to the GPU per frame
  }
}

/**
 * Holds state about how much data has been loaded by CadSectorLoader.
 */
interface CadSectorsState {
  /**
   * Loaded and visible sectors.
   */
  readonly activeSectors: Sector[];
  /**
   * Sectors loaded, but not visible yet. A sector can
   * be loaded and not active/visible when other sectors
   * still must be loaded in order to replace a lower LOD level.
   */
  readonly loadedSectors: Sector[];
  /**
   * Sectors currently being downloaded or processed.
   */
  readonly inflightSectors: Sector[];
  /**
   * Sectors awaiting download and processing.
   */
  readonly pendingSectors: Sector[];
  /**
   * Sectors we want to load. When activeSectors are
   * identical to this loading is complete.
   */
  readonly wantedSectors: Sector[];

  /**
   * Returns the identifier of the batch we are currently loading.
   */
  readonly currentBatchId: number;

  /**
   * Sets a new "target" set of sectors to load. Starts download
   * and processing the list.
   */
  setWantedSectors(sectors: Sector[]): { batchId: number };

  notifySectorsInflight(sectors: [Sector, SectorProcessing][]): void;
  notifySectorsLoaded(sectorss: [Sector, THREE.Object3D][]): void;

  activateSectors(sectors: Sector[]): void;
  deactivateAndUnloadSectors(sector: Sector[]): void;
}

/**
 * Represents a sector being downloaded and processed.
 */
interface SectorProcessing {
  readonly sector: Sector;
  cancel(): void;
  process(): Promise<THREE.Object3D>;
}

/**
 * Downloads and parses/processes sector data. Responsible
 * for throttling, error handling, caching etc.
 */
class CadSectorFetcher {
  constructor(sectors: Sector[]) {
    // Start downloading and processing sectors
  }

  /**
   * Returns sectors that has been downloaded since the last
   * time this function was called.
   */
  takeNewlyDownloaded(): [Sector, THREE.Object3D][] {
    return [];
  }

  /**
   * Returns the sectors that has been initiated for download/processing
   * since the last time the function was called.
   */
  takeNewInflightSectors(): [Sector, SectorProcessing][] {
    return [];
  }

  cancel(): void {}
}

/**
 * Determines what sectors to deactivate and activate sectors as a result
 * of being loaded.
 */
class CadSectorActivator {
  constructor(state: CadSectorsState) {}

  /**
   * Determine what sectors can be activated while having a valid
   * set of active sectors.
   */
  determineActivatable(): { activable: Sector[]; deactivable: Sector[] } {
    return { activable: [], deactivable: [] };
  }
}
