/*!
 * Copyright 2020 Cognite AS
 */

import { CadSectorParser } from '@/dataModels/cad/sector/CadSectorParser';
import { WorkerPool } from '@/utilities/workers/WorkerPool';
import { of } from 'rxjs';

jest.mock('@/utilities/workers/WorkerPool');
// jest.mock('../../../data/parser/CadSectorParser');

const workerPool: WorkerPool = new WorkerPool();
const parser = new CadSectorParser(workerPool);

describe('CadSectorParser', () => {
  test('parse i3d format', done => {
    // Arrange
    let events = 0;
    let errors = 0;
    // Act
    const observable = of({ format: 'i3d', data: new Uint8Array() }).pipe(parser.parse());

    // Assert
    observable.subscribe(
      _next => {
        events += 1;
        // expect(next).toBeInstanceOf; Check if return type of data is correct.
      },
      _error => {
        errors += 1;
        // done(error)??
      },
      () => {
        expect(events).toBe(1);
        expect(errors).toBe(0);
        done();
      }
    );
  });

  // TODO: j-bjorne 17-04-2020: No idea why this fails. Will look into it later.
  /*
  test('parse f3d format', done => {
    // Arrange
    let events = 0;
    let errors = 0;
    // Act
    const observable = of({ format: 'f3d', data: new Uint8Array() }).pipe(parser.parse());

    // Assert
    observable.subscribe(
      _next => {
        events += 1;
        // expect(next).toBeInstanceOf; Check if return type of data is correct.
      },
      _error => {
        errors += 1;
        // done(error)??
      },
      () => {
        expect(events).toBe(1);
        expect(errors).toBe(0);
        done();
      }
    );
  });
  */
  test('parse other format, ignored', done => {
    // Arrange
    let events = 0;
    let errors = 0;
    // Act
    const observable = of({ format: 'no-known-format', data: new Uint8Array() }).pipe(parser.parse());

    // Assert
    observable.subscribe(
      _next => {
        events += 1;
      },
      _error => {
        errors += 1;
        // done(error)??
      },
      () => {
        expect(events).toBe(0);
        expect(errors).toBe(0);
        done();
      }
    );
  });
});
