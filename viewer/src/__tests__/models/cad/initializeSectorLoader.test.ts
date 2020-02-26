/*!
 * Copyright 2020 Cognite AS
 */

import { initializeSectorLoader } from '../../../models/cad/initializeSectorLoader';
import { DiscardSectorDelegate, ConsumeSectorDelegate, GetSectorDelegate } from '../../../models/cad/delegates';
import { waitUntill, yieldProcessing } from '../../wait';
import { expectSetEqual } from '../../expects';
import { Sector } from '../../../models/cad/types';

describe('initializeSectorLoader', () => {
  const consumed = new Set<number>();
  const discarded = new Set<number>();

  const getSector: GetSectorDelegate<Sector> = jest.fn();
  const consume: ConsumeSectorDelegate<Sector> = (sectorId, _sector) => consumed.add(sectorId);
  const discard: DiscardSectorDelegate = id => discarded.add(id);

  const awaitUpdateToProcess = yieldProcessing; // We simply need to yield processing to allow processing loop to process Promises created by update()

  beforeEach(() => {
    jest.resetAllMocks();
    consumed.clear();
    discarded.clear();
  });

  test('call returns delegate', () => {
    const delegate = initializeSectorLoader(getSector, discard, consume);
    expect(delegate).toBeDefined();
  });

  test('first delegate invocation calls consume is called for all sectors', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(getSector, discard, consume);
    const sectorIds = [1, 2, 3];

    // Act
    activateSectorsDelegate.update(new Set<number>(sectorIds));
    await awaitUpdateToProcess();
    for (const _ of sectorIds) {
      activateSectorsDelegate.refresh();
    }
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));

    // Assert
    expectSetEqual(consumed, sectorIds);
  });

  test('second invocation only consumes new sectors', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(getSector, discard, consume);
    const sectorIds = [1, 2, 3];
    activateSectorsDelegate.update(new Set<number>(sectorIds));
    await awaitUpdateToProcess();
    for (const _ of sectorIds) {
      activateSectorsDelegate.refresh();
    }
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));
    const newSectorIds = [1, 2, 3, 4, 5];

    // Act
    activateSectorsDelegate.update(new Set<number>(newSectorIds));
    await awaitUpdateToProcess();
    for (const _ of newSectorIds) {
      activateSectorsDelegate.refresh();
    }
    await waitUntill(() => newSectorIds.every(x => consumed.has(x)));

    // Assert
    expectSetEqual(consumed, newSectorIds);
  });

  test('second invocation discards unwanted sectors', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(getSector, discard, consume);
    const sectorIds = [1, 2, 3, 4, 5];
    activateSectorsDelegate.update(new Set<number>(sectorIds));
    await awaitUpdateToProcess();
    for (const _ of sectorIds) {
      activateSectorsDelegate.refresh();
    }
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));
    const newSectorIds = [1, 3, 5];

    // Act
    activateSectorsDelegate.update(new Set<number>(newSectorIds));
    await awaitUpdateToProcess();
    for (const _ of newSectorIds) {
      activateSectorsDelegate.refresh();
    }
    await waitUntill(() => [2, 4].every(x => discarded.has(x)));

    // Assert
    expectSetEqual(discarded, [2, 4]);
  });

  test('activate previously discarded sector, reloads', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(getSector, discard, consume);

    // Act
    activateSectorsDelegate.update(
      new Set<number>([1])
    );
    await awaitUpdateToProcess();
    activateSectorsDelegate.refresh();
    await waitUntill(() => consumed.has(1));
    consumed.clear();
    activateSectorsDelegate.update(new Set<number>());
    await awaitUpdateToProcess();
    activateSectorsDelegate.refresh();
    await waitUntill(() => discarded.has(1));
    activateSectorsDelegate.update(
      new Set<number>([1])
    );
    await awaitUpdateToProcess();
    activateSectorsDelegate.refresh();
    await waitUntill(() => consumed.has(1));

    // Assert
    expectSetEqual(consumed, [1]);
  });
});
