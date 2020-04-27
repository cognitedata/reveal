/*!
 * Copyright 2020 Cognite AS
 */

// import { CachedRepository } from '../../../repository/cad/CachedRepository';

// import 'jest-extended';
// import { CadModel } from '../../../models/cad/CadModel';
// import { Box3 } from '../../../utils/Box3';
// import { vec3, mat4 } from 'gl-matrix';

// TODO add back these tests

// function createMockModel(): CadModel {
// return {
// fetchSectorDetailed: jest.fn(),
// fetchSectorSimple: jest.fn(),
// fetchCtm: jest.fn(),
// parseDetailed: jest.fn(),
// parseSimple: jest.fn(),

// scene: {
// version: 8,
// maxTreeIndex: 0,
// root: {
// id: 0,
// path: '',
// depth: 0,
// indexFile: {
// fileName: 'sector_0.i3d',
// peripheralFiles: [],
// downloadSize: 1000,
// estimatedDrawCallCount: 1
// },
// facesFile: {
// fileName: null,
// quadSize: 0.5,
// coverageFactors: {
// xy: 0,
// xz: 0,
// yz: 0
// },
// downloadSize: 0
// },
// bounds: new Box3([vec3.create(), vec3.create()]),
// children: []
// },
// sectors: new Map()
// },
// modelTransformation: {
// modelMatrix: mat4.create(),
// inverseModelMatrix: mat4.create()
// }
// };
// }

describe('CachedRepository', () => {
  test('noop', () => {});
  // test('calls fetch and parse only once', async () => {
  // const cadModel = createMockModel();
  // const repo = new CachedRepository(cadModel);
  // await repo.loadSector(0);
  // await repo.getDetailed(0);
  // await repo.getDetailed(0);
  // await repo.getDetailed(0);
  // await repo.getSimple(0);
  // await repo.getSimple(0);
  // await repo.getSimple(0);
  // await repo.getSimple(0);
  // expect(cadModel.fetchSectorDetailed).toBeCalledTimes(1);
  // expect(cadModel.parseDetailed).toBeCalledTimes(1);
  // expect(cadModel.fetchSectorSimple).toBeCalledTimes(1);
  // expect(cadModel.parseSimple).toBeCalledTimes(1);
  // });
  // test('clearing cache makes it call again, but only once', async () => {
  // const cadModel = createMockModel();
  // const repo = new CachedRepository(cadModel);
  // await repo.getDetailed(0);
  // expect(cadModel.fetchSectorDetailed).toBeCalledTimes(1);
  // expect(cadModel.parseDetailed).toBeCalledTimes(1);
  // await repo.getSimple(0);
  // expect(cadModel.fetchSectorSimple).toBeCalledTimes(1);
  // expect(cadModel.parseSimple).toBeCalledTimes(1);
  // repo.clearCache();
  // await repo.getDetailed(0);
  // await repo.getDetailed(0);
  // await repo.getDetailed(0);
  // await repo.getDetailed(0);
  // expect(cadModel.fetchSectorDetailed).toBeCalledTimes(2);
  // expect(cadModel.parseDetailed).toBeCalledTimes(2);
  // await repo.getSimple(0);
  // await repo.getSimple(0);
  // await repo.getSimple(0);
  // await repo.getSimple(0);
  // expect(cadModel.fetchSectorSimple).toBeCalledTimes(2);
  // expect(cadModel.parseSimple).toBeCalledTimes(2);
  // });
});
