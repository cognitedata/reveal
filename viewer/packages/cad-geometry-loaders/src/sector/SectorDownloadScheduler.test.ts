/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, LevelOfDetail, WantedSector, SectorMetadata } from '@reveal/cad-parsers';
import { DeferredPromise } from '@reveal/utilities/src/DeferredPromise';
import { IMock, Mock } from 'moq.ts';
import { SectorDownloadData, SectorDownloadScheduler } from './SectorDownloadScheduler';
import Log from '@reveal/logger';
import { LogLevelNumbers } from 'loglevel';
import { err, Result } from 'neverthrow';

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
    expect(wantedSectors[0].modelIdentifier).toBe(downloadedSector._unsafeUnwrap().modelIdentifier);
    expect(wantedSectors[0].metadata.id).toBe(downloadedSector._unsafeUnwrap().metadata.id);
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

    expect(resolvedFirstSector._unsafeUnwrap().metadata.id).toBe(resolvedSecondSector._unsafeUnwrap().metadata.id);
    expect(resolvedFirstSector._unsafeUnwrap().modelIdentifier).toBe(
      resolvedSecondSector._unsafeUnwrap().modelIdentifier
    );
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
        return err(new Error('Sector with ID 11 failed'));
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
      if (sector.isErr()) {
        expect(sector._unsafeUnwrapErr().message).toBe('Sector with ID 11 failed');
      } else {
        expect(sector._unsafeUnwrap().levelOfDetail).toBe(LevelOfDetail.Detailed);
      }
    });
  });
});

function createMockWantedSectors(numberOfSectors: number, modelIdentifier: string): WantedSector[] {
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
      .returns(modelIdentifier)
      .object();
  });
}

function createConsumedSectorMock(wantedSector: WantedSector): IMock<Result<ConsumedSector, Error>> {
  const consumedSector = new Mock<Result<ConsumedSector, Error>>()
    .setup(p => p._unsafeUnwrap().modelIdentifier)
    .returns(wantedSector.modelIdentifier)
    .setup(p => p._unsafeUnwrap().metadata)
    .returns(
      new Mock<SectorMetadata>()
        .setup(p => p.id)
        .returns(wantedSector.metadata.id)
        .object()
    )
    .setup(p => p._unsafeUnwrap().levelOfDetail)
    .returns(LevelOfDetail.Detailed);
  return consumedSector;
}
