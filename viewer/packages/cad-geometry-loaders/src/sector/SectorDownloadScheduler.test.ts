/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, LevelOfDetail, WantedSector, SectorMetadata } from '@reveal/cad-parsers';
import { DeferredPromise } from '@reveal/utilities/src/DeferredPromise';
import { IMock, Mock } from 'moq.ts';
import { SectorDownloadData, SectorDownloadScheduler } from './SectorDownloadScheduler';
import { Log } from '@reveal/logger';
import { LogLevelNumbers } from 'loglevel';
import { LocalModelIdentifier } from '@reveal/data-providers';

describe(SectorDownloadScheduler.name, () => {
  let sectorDownloadScheduler: SectorDownloadScheduler;
  let currentLogLevel: LogLevelNumbers;

  beforeAll(() => {
    currentLogLevel = Log.getLevel();
    Log.setLevel('silent');
  });

  afterAll(() => {
    Log.setLevel(currentLogLevel);
  });

  beforeEach(() => {
    const queueSize = 20;
    sectorDownloadScheduler = new SectorDownloadScheduler(queueSize);
  });

  test('Adding one sector properly queues the sector and downloads it', async () => {
    // Setup
    const wantedSectors = createMockWantedSectors(1, 'TestModelIdentifier');
    const downloadSectorMock = async (sector: WantedSector) => {
      return createConsumedSectorMock(sector).object();
    };

    const sectorDownloadData: SectorDownloadData[] = wantedSectors.map(sector => {
      return { sector, downloadSector: downloadSectorMock };
    });

    // Act
    const downloadedSector = await Promise.any(sectorDownloadScheduler.queueSectorBatchForDownload(sectorDownloadData));

    // Assert
    expect(wantedSectors[0].modelIdentifier).toBe(downloadedSector.modelIdentifier);
    expect(wantedSectors[0].metadata.id).toBe(downloadedSector.metadata.id);
  });

  test('Adding the same sector twice should not increment queue and resolve to same instance', async () => {
    // Setup
    const wantedSectors = createMockWantedSectors(1, 'TestModelIdentifier');
    const stalledDownload = new DeferredPromise<void>();
    const downloadSectorMock = async (sector: WantedSector) => {
      await stalledDownload;
      return createConsumedSectorMock(sector).object();
    };

    // Act
    const firstBatch = sectorDownloadScheduler.queueSectorBatchForDownload([
      { sector: wantedSectors[0], downloadSector: downloadSectorMock }
    ]);
    const secondBatch = sectorDownloadScheduler.queueSectorBatchForDownload([
      { sector: wantedSectors[0], downloadSector: downloadSectorMock }
    ]);

    // Assert
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(1);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(0);

    stalledDownload.resolve();

    const resolvedFirstSector = await firstBatch[0];
    const resolvedSecondSector = await secondBatch[0];

    expect(resolvedFirstSector.metadata.id).toBe(resolvedSecondSector.metadata.id);
    expect(resolvedFirstSector.modelIdentifier).toBe(resolvedSecondSector.modelIdentifier);
  });

  test('When a pending sector is finished, a new sector should be downloaded from the queue', async () => {
    // Setup
    const wantedSectors = createMockWantedSectors(21, 'TestModelIdentifier');
    const stalledDownload = new DeferredPromise<void>();
    const downloadSectorMock = async (sector: WantedSector) => {
      if (sector.metadata.id === 0) {
        return createConsumedSectorMock(sector).object();
      }
      await stalledDownload;
      return createConsumedSectorMock(sector).object();
    };

    const sectorDownloadData: SectorDownloadData[] = wantedSectors.map(sector => {
      return { sector, downloadSector: downloadSectorMock };
    });

    // Act
    const queuedSectorBatch = sectorDownloadScheduler.queueSectorBatchForDownload(sectorDownloadData);

    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(20);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(1);

    await Promise.any(queuedSectorBatch);

    // Assert
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(20);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(0);
  });

  test('The download queue should be able to flush twice', async () => {
    // Setup
    const wantedSectors = createMockWantedSectors(41, 'TestModelIdentifier');

    const firstStalledDownload = new DeferredPromise<void>();
    const secondStalledDownload = new DeferredPromise<void>();
    const thirdStalledDownload = new DeferredPromise<void>();

    const downloadSectorMock = async (sector: WantedSector) => {
      if (sector.metadata.id < 20) {
        await firstStalledDownload;
        return createConsumedSectorMock(sector).object();
      } else if (sector.metadata.id < 40) {
        await secondStalledDownload;
        return createConsumedSectorMock(sector).object();
      }

      await thirdStalledDownload;
      return createConsumedSectorMock(sector).object();
    };

    const sectorDownloadData: SectorDownloadData[] = wantedSectors.map(sector => {
      return { sector, downloadSector: downloadSectorMock };
    });

    // Act
    const queuedSectorBatch = sectorDownloadScheduler.queueSectorBatchForDownload(sectorDownloadData);

    // Assert
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(20);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(21);

    // release first set
    firstStalledDownload.resolve();
    await Promise.all(queuedSectorBatch.slice(0, 20));
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(20);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(1);

    // release second set
    secondStalledDownload.resolve();
    await Promise.all(queuedSectorBatch.slice(20, 40));
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(1);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(0);

    // release third set
    thirdStalledDownload.resolve();
    await queuedSectorBatch[40];
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(0);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(0);
  });

  test('If a sector fails, it should return a discarded consumed sector', async () => {
    // Setup
    const wantedSectors = createMockWantedSectors(21, 'TestModelIdentifier');
    const stalledDownload = new DeferredPromise<void>();
    const downloadSectorMock = async (sector: WantedSector) => {
      await stalledDownload;
      if (sector.metadata.id === 11) {
        throw new Error('Sector with ID 11 failed');
      }
      return createConsumedSectorMock(sector).object();
    };

    const sectorDownloadData: SectorDownloadData[] = wantedSectors.map(sector => {
      return { sector, downloadSector: downloadSectorMock };
    });

    // Act
    const queuedSectorBatch = sectorDownloadScheduler.queueSectorBatchForDownload(sectorDownloadData);

    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(20);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(1);

    stalledDownload.resolve();
    const resolvedSectors = await Promise.all(queuedSectorBatch);

    // Assert
    expect(sectorDownloadScheduler.numberOfPendingDownloads).toBe(0);
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(0);

    resolvedSectors.forEach(sector => {
      if (sector.metadata.id === 11) {
        expect(sector.levelOfDetail).toBe(LevelOfDetail.Discarded);
      } else {
        expect(sector.levelOfDetail).toBe(LevelOfDetail.Detailed);
      }
    });
  });

  test('Sector downloads of downloading discarded sectors should abort', async () => {
    // Setup
    const abortedCount = 11;
    const initalDownloadCount = 21;
    const wantedSectors = createMockWantedSectors(initalDownloadCount, 'TestModelIdentifier');
    const discardedSectors = createMockWantedSectors(abortedCount, 'TestModelIdentifier', LevelOfDetail.Discarded);
    const abortSignals = new Array<AbortSignal>();

    const stalledDownload = new DeferredPromise<void>();
    const dowloadSectorMock = async (sector: WantedSector, abortSignal?: AbortSignal) => {
      if (abortSignal) abortSignals.push(abortSignal);
      await stalledDownload;
      if (abortSignal?.aborted) {
        // Simulate fetch failing due to abort
        return createDiscardedConsumedSectorMock(sector);
      }
      return createConsumedSectorMock(sector).object();
    };

    // Act
    const download1 = sectorDownloadScheduler.queueSectorBatchForDownload(
      wantedSectors.map(sector => {
        return { sector, downloadSector: dowloadSectorMock };
      })
    );

    const download2 = sectorDownloadScheduler.queueSectorBatchForDownload(
      discardedSectors.map(sector => {
        return { sector, downloadSector: dowloadSectorMock };
      })
    );

    stalledDownload.resolve();

    const resolvedSectors1 = await Promise.all(download1);
    await Promise.all(download2);

    // Assert
    expect(abortSignals.length).toEqual(initalDownloadCount);

    abortSignals.forEach((abortSignal, index) => {
      if (index < abortedCount) {
        expect(abortSignal.aborted).toBe(true);
      } else {
        expect(abortSignal.aborted).toBe(false);
      }
    });

    resolvedSectors1.forEach(sector => {
      if (sector.metadata.id < abortedCount) {
        expect(sector.levelOfDetail).toBe(LevelOfDetail.Discarded);
      } else {
        expect(sector.levelOfDetail).toBe(LevelOfDetail.Detailed);
      }
    });
  });

  test('Queued sector downloads should be removed from the queue when discarded', async () => {
    // Setup
    const wantedSectors = createMockWantedSectors(21, 'TestModelIdentifier');
    const discardedSectors = createMockWantedSectors(21, 'TestModelIdentifier', LevelOfDetail.Discarded);

    const stalledDownload = new DeferredPromise<void>();
    const dowloadSectorMock = async (sector: WantedSector, abortSignal?: AbortSignal) => {
      await stalledDownload;
      if (abortSignal?.aborted) {
        // Simulate fetch failing due to abort
        return createDiscardedConsumedSectorMock(sector);
      }
      return createConsumedSectorMock(sector).object();
    };

    // Act
    const firstDownload = sectorDownloadScheduler.queueSectorBatchForDownload(
      wantedSectors.map(sector => {
        return { sector, downloadSector: dowloadSectorMock };
      })
    );

    sectorDownloadScheduler.queueSectorBatchForDownload(
      discardedSectors.map(sector => {
        return { sector, downloadSector: dowloadSectorMock };
      })
    );

    // Assert
    expect(sectorDownloadScheduler.numberOfQueuedDownloads).toBe(0);

    stalledDownload.resolve();
    const resolvedSectors = await Promise.all(firstDownload);

    resolvedSectors.forEach(sector => {
      expect(sector.levelOfDetail).toBe(LevelOfDetail.Discarded);
    });
  });
});

function createMockWantedSectors(
  numberOfSectors: number,
  modelIdentifier: string,
  levelOfDetail = LevelOfDetail.Detailed
): WantedSector[] {
  return Array.from(Array(numberOfSectors).keys()).map((_, index) => {
    return new Mock<WantedSector>()
      .setup(p => p.metadata)
      .returns(
        new Mock<SectorMetadata>()
          .setup(p => p.id)
          .returns(index)
          .object()
      )
      .setup(p => p.modelIdentifier)
      .returns(new LocalModelIdentifier(modelIdentifier))
      .setup(p => p.levelOfDetail)
      .returns(levelOfDetail)
      .object();
  });
}

function createConsumedSectorMock(wantedSector: WantedSector): IMock<ConsumedSector> {
  const consumedSector = new Mock<ConsumedSector>()
    .setup(p => p.modelIdentifier)
    .returns(wantedSector.modelIdentifier)
    .setup(p => p.metadata)
    .returns(
      new Mock<SectorMetadata>()
        .setup(p => p.id)
        .returns(wantedSector.metadata.id)
        .object()
    )
    .setup(p => p.levelOfDetail)
    .returns(wantedSector.levelOfDetail);
  return consumedSector;
}

function createDiscardedConsumedSectorMock(sector: WantedSector): ConsumedSector {
  return {
    modelIdentifier: sector.modelIdentifier,
    metadata: sector.metadata,
    levelOfDetail: LevelOfDetail.Discarded,
    group: undefined,
    instancedMeshes: undefined
  };
}
