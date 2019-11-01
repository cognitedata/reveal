/*!
 * Copyright 2019 Cognite AS
 */

import { initializeSectorLoader } from '../../sector/initializeSectorLoader';
import {
  DiscardSectorDelegate,
  ConsumeSectorDelegate,
  FetchSectorDelegate,
  ParseSectorDelegate
} from '../../sector/delegates';
import { waitUntill } from '../wait';
import { expectSetEqual } from '../expects';
import { Sector } from '../../sector/types';

describe('initializeSectorLoader', () => {
  const consumed = new Set<number>();
  const discarded = new Set<number>();

  const fetch: FetchSectorDelegate = jest.fn();
  const parse: ParseSectorDelegate<Sector> = jest.fn();
  const consume: ConsumeSectorDelegate<Sector> = (sectorId, sector) => consumed.add(sectorId);
  const discard: DiscardSectorDelegate = id => discarded.add(id);

  beforeEach(() => {
    jest.resetAllMocks();
    consumed.clear();
    discarded.clear();
  });

  test('call returns delegate', () => {
    const delegate = initializeSectorLoader(fetch, parse, discard, consume);
    expect(delegate).toBeDefined();
  });

  test('first delegate invocation calls consume is called for all sectors', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(fetch, parse, discard, consume);
    const sectorIds = [1, 2, 3];

    // Act
    activateSectorsDelegate(new Set<number>(sectorIds));
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));

    // Assert
    expectSetEqual(consumed, sectorIds);
  });

  test('second invocation only consumes new sectors', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(fetch, parse, discard, consume);
    const sectorIds = [1, 2, 3];
    activateSectorsDelegate(new Set<number>(sectorIds));
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));
    const newSectorIds = [1, 2, 3, 4, 5];

    // Act
    activateSectorsDelegate(new Set<number>(newSectorIds));
    await waitUntill(() => newSectorIds.every(x => consumed.has(x)));

    // Assert
    expectSetEqual(consumed, newSectorIds);
  });

  test('second invocation discards unwanted sectors', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(fetch, parse, discard, consume);
    const sectorIds = [1, 2, 3, 4, 5];
    activateSectorsDelegate(new Set<number>(sectorIds));
    await waitUntill(() => sectorIds.every(x => consumed.has(x)));
    const newSectorIds = [1, 3, 5];

    // Act
    activateSectorsDelegate(new Set<number>(newSectorIds));
    await waitUntill(() => [2, 4].every(x => discarded.has(x)));

    // Assert
    expectSetEqual(discarded, [2, 4]);
  });

  test('activate previously discarded sector, reloads', async () => {
    // Arrange
    const activateSectorsDelegate = initializeSectorLoader(fetch, parse, discard, consume);

    // Act
    activateSectorsDelegate(new Set<number>([1]));
    await waitUntill(() => consumed.has(1));
    consumed.clear();
    activateSectorsDelegate(new Set<number>());
    await waitUntill(() => discarded.has(1));
    activateSectorsDelegate(new Set<number>([1]));
    await waitUntill(() => consumed.has(1));

    // Assert
    expectSetEqual(consumed, [1]);
  });
});
