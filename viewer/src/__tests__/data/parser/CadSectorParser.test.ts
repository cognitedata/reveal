/*!
 * Copyright 2020 Cognite AS
 */

import { of } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { CadSectorParser } from '@/datamodels/cad/sector/CadSectorParser';
import { WorkerPool } from '@/utilities/workers/WorkerPool';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { ParsedPrimitives } from '@/utilities/workers/types/reveal.parser.types';

jest.mock('@/utilities/workers/WorkerPool');

describe('CadSectorParser', () => {
  const workerPool: WorkerPool = new WorkerPool();
  const parser = new CadSectorParser(workerPool);

  jest.useFakeTimers();

  test('parse and finalize i3d format', async () => {
    // Arrange
    let events = 0;
    let errors = 0;
    const result: SectorGeometry = {
      treeIndexToNodeIdMap: new Map(),
      nodeIdToTreeIndexMap: new Map(),
      primitives: {} as ParsedPrimitives,
      instanceMeshes: [],
      triangleMeshes: []
    };
    jest.spyOn(workerPool, 'postWorkToAvailable').mockImplementation(() => {
      return Promise.resolve(result);
    });
    // Act
    const observable = of({ format: 'i3d', data: new Uint8Array() }).pipe(
      flatMap(_ => parser.parseAndFinalizeDetailed('', { blobUrl: '', headers: {} }))
    );

    // Assert
    observable.subscribe(
      _next => {
        events += 1;
      },
      _error => {
        errors += 1;
      },
      () => {
        expect(events).toBe(1);
        expect(errors).toBe(0);
        // done();
      }
    );
    await observable.toPromise();
    jest.advanceTimersByTime(1000);
  });

  // TODO: j-bjorne 17-04-2020: No idea why this fails. Will look into it later.
  test('parse f3d format', async () => {
    // Arrange
    let events = 0;
    let errors = 0;
    const result: SectorQuads = {
      treeIndexToNodeIdMap: new Map(),
      nodeIdToTreeIndexMap: new Map(),
      buffer: new Float32Array()
    };
    jest.spyOn(workerPool, 'postWorkToAvailable').mockImplementation(() => {
      return Promise.resolve(result);
    });

    // Act
    const observable = of({ format: 'f3d', data: new Uint8Array() }).pipe(flatMap(x => parser.parseF3D(x.data)));

    // Assert
    observable.subscribe(
      _next => {
        events += 1;
      },
      _error => {
        errors += 1;
      },
      () => {
        expect(events).toBe(1);
        expect(errors).toBe(0);
        // done();
      }
    );
    await observable.toPromise();
    jest.advanceTimersByTime(1000);
    jest.runAllTimers();
  });
});
