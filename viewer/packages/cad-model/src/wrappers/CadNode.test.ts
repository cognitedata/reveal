/*!
 * Copyright 2025 Cognite AS
 */
import { Mock } from 'moq.ts';
import { CadNode } from './CadNode';
import { SectorRepository } from '@reveal/sector-loader';
import { Plane, Matrix4, Vector3 } from 'three';
import { WantedSector, ConsumedSector } from '@reveal/cad-parsers';

import { jest } from '@jest/globals';
import { createCadNode } from '../../../../test-utilities/src/createCadNode';
import { createMockedConsumedSector, createWantedSectorMock } from '@reveal/sector-loader/tests/mockSectorUtils';

describe(CadNode.name, () => {
  test('should not call sector repository cache clear on removal', () => {
    const clearCacheMock = jest.fn();
    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.clearCache)
      .returns(clearCacheMock)
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });

    cadNode.dispose();

    expect(clearCacheMock).not.toHaveBeenCalled();
  });

  test('needsRedraw getter returns correct redraw state', () => {
    const cadNode = createCadNode();

    // Initially should not need redraw
    expect(cadNode.needsRedraw).toBe(false);

    // After transformation change, should need redraw
    cadNode.setModelTransformation(new Matrix4().makeRotationY(Math.PI / 4));
    expect(cadNode.needsRedraw).toBe(true);
  });

  test('resetRedraw method resets redraw state', () => {
    const cadNode = createCadNode();

    // Set up a state where redraw is needed
    cadNode.setModelTransformation(new Matrix4().makeRotationY(Math.PI / 4));
    expect(cadNode.needsRedraw).toBe(true);

    // Reset redraw state
    cadNode.resetRedraw();
    expect(cadNode.needsRedraw).toBe(false);
  });

  test('defaultNodeAppearance getter returns default appearance', () => {
    const cadNode = createCadNode();

    const defaultAppearance = cadNode.defaultNodeAppearance;
    expect(defaultAppearance).toBeDefined();
  });

  test('defaultNodeAppearance setter updates appearance and triggers render layer update', () => {
    const cadNode = createCadNode();
    const setModelRenderLayersSpy = jest.spyOn(cadNode, 'setModelRenderLayers');

    const newAppearance = { renderGhosted: true, visible: true };
    cadNode.defaultNodeAppearance = newAppearance;

    expect(setModelRenderLayersSpy).toHaveBeenCalled();
  });

  test('clippingPlanes getter returns current clipping planes', () => {
    const cadNode = createCadNode();

    const clippingPlanes = cadNode.clippingPlanes;
    expect(Array.isArray(clippingPlanes)).toBe(true);
  });

  test('clippingPlanes setter updates clipping planes', () => {
    const cadNode = createCadNode();
    const testPlanes = [new Plane(new Vector3(1, 0, 0), 5), new Plane(new Vector3(0, 1, 0), -3)];

    cadNode.clippingPlanes = testPlanes;

    const retrievedPlanes = cadNode.clippingPlanes;
    expect(retrievedPlanes).toEqual(testPlanes);
  });

  test('rootSector getter returns root sector node', () => {
    const cadNode = createCadNode();

    const rootSector = cadNode.rootSector;
    expect(rootSector).toBeDefined();
    expect(rootSector.type).toBeDefined(); // RootSectorNode should have a type
  });

  test('isDisposed getter returns disposal state', () => {
    const cadNode = createCadNode();

    // Initially not disposed
    expect(cadNode.isDisposed).toBe(false);

    // After disposal
    cadNode.dispose();
    expect(cadNode.isDisposed).toBe(true);
  });

  test('loadSector method delegates to sector repository', async () => {
    const mockedConsumedSector = createMockedConsumedSector();
    const mockLoadSectorFn = jest.fn<(sector: WantedSector, abortSignal?: AbortSignal) => Promise<ConsumedSector>>();
    mockLoadSectorFn.mockResolvedValue(mockedConsumedSector.object());

    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.loadSector)
      .returns(mockLoadSectorFn)
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });
    const wantedSector = createWantedSectorMock();
    const abortSignal = new AbortController().signal;

    await cadNode.loadSector(wantedSector.object(), abortSignal);

    expect(mockLoadSectorFn).toHaveBeenCalledWith(wantedSector.object(), abortSignal);
  });

  test('loadSector method works without abort signal', async () => {
    const mockedConsumedSector = createMockedConsumedSector();
    const mockLoadSectorFn = jest.fn<(sector: WantedSector, abortSignal?: AbortSignal) => Promise<ConsumedSector>>();
    mockLoadSectorFn.mockResolvedValue(mockedConsumedSector.object());

    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.loadSector)
      .returns(mockLoadSectorFn)
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });
    const wantedSector = createWantedSectorMock();

    await cadNode.loadSector(wantedSector.object());

    expect(mockLoadSectorFn).toHaveBeenCalledWith(wantedSector.object(), undefined);
  });
});
