/*!
 * Copyright 2022 Cognite AS
 */

import { ConsumedSector, WantedSector } from '@reveal/cad-parsers';
import { DeferredPromise } from '@reveal/utilities/src/DeferredPromise';
import { IMock, Mock } from 'moq.ts';
import { SectorDownloadScheduler } from './SectorDownloadScheduler';

describe('SectorDownloadScheduler', () => {
  let sectorDownloadScheduler: SectorDownloadScheduler;
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

    // Act
    const downloadedSector = await Promise.any(
      sectorDownloadScheduler.queueSectorBatchForDownload(wantedSectors, downloadSectorMock)
    );

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
    const firstBatch = sectorDownloadScheduler.queueSectorBatchForDownload([wantedSectors[0]], downloadSectorMock);
    const secondBatch = sectorDownloadScheduler.queueSectorBatchForDownload([wantedSectors[0]], downloadSectorMock);

    // Assert
    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(1);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(0);

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

    // Act
    const queuedSectorBatch = sectorDownloadScheduler.queueSectorBatchForDownload(wantedSectors, downloadSectorMock);

    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(20);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(1);

    await Promise.any(queuedSectorBatch);

    // Assert
    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(20);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(0);
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

    // Act
    const queuedSectorBatch = sectorDownloadScheduler.queueSectorBatchForDownload(wantedSectors, downloadSectorMock);

    // Assert
    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(20);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(21);

    // release first set
    firstStalledDownload.resolve();
    await Promise.all(queuedSectorBatch.slice(0, 20));
    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(20);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(1);

    // release second set
    secondStalledDownload.resolve();
    await Promise.all(queuedSectorBatch.slice(20, 40));
    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(1);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(0);

    // release third set
    thirdStalledDownload.resolve();
    await queuedSectorBatch[40];
    expect((sectorDownloadScheduler as any)._pendingSectorDownloads.size).toBe(0);
    expect((sectorDownloadScheduler as any)._queuedSectorDownloads.size).toBe(0);
  });
});

function createMockWantedSectors(numberOfSectors: number, modelIdentifier: string): WantedSector[] {
  return Array.from(Array(numberOfSectors).keys()).map((_, index) =>
    new Mock<WantedSector>()
      .setup(p => p.metadata.id)
      .returns(index)
      .setup(p => p.modelIdentifier)
      .returns(modelIdentifier)
      .object()
  );
}

function createConsumedSectorMock(wantedSector: WantedSector): IMock<ConsumedSector> {
  const consumedSector = new Mock<ConsumedSector>()
    .setup(p => p.modelIdentifier)
    .returns(wantedSector.modelIdentifier)
    .setup(p => p.metadata.id)
    .returns(wantedSector.metadata.id);
  return consumedSector;
}
