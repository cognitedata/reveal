/*!
 * Copyright 2025 Cognite AS
 */
import { CadManager } from './CadManager';
import type { CadMaterialManager } from '@reveal/rendering';
import type { CadModelFactory } from '@reveal/cad-model';
import type { CadModelUpdateHandler } from './CadModelUpdateHandler';
import type { IMock } from 'moq.ts';
import { It, Mock } from 'moq.ts';
import { PerspectiveCamera, Box3 } from 'three';
import { CdfModelIdentifier, File3dFormat } from '@reveal/data-providers';
import type { CadModelMetadata } from '@reveal/cad-parsers';
import { createCadModelMetadata, createCadNode, createV9SectorMetadata } from '../../../test-utilities';
import type { CadNode } from '@reveal/cad-model';
import type { SectorRepository } from '@reveal/sector-loader';
import { PickCacheInvalidator } from '@reveal/utilities';

function createMinimalMetadata(format: File3dFormat, formatVersion: number): CadModelMetadata {
  const root = createV9SectorMetadata([0, [], new Box3()]);
  const base = createCadModelMetadata(formatVersion, root);
  return { ...base, format, formatVersion };
}

describe(CadManager.name, () => {
  let cadManager: CadManager;
  let materialManagerMock: IMock<CadMaterialManager>;
  let cadModelFactoryMock: IMock<CadModelFactory>;
  let updateHandlerMock: IMock<CadModelUpdateHandler>;
  let pickCacheInvalidator: PickCacheInvalidator;

  beforeEach(() => {
    materialManagerMock = new Mock<CadMaterialManager>().setup(p => p.dispose()).returns();

    cadModelFactoryMock = new Mock<CadModelFactory>().setup(p => p.dispose()).returns();

    updateHandlerMock = new Mock<CadModelUpdateHandler>()
      .setup(p => p.budget)
      .returns({
        highDetailProximityThreshold: 100,
        maximumRenderCost: 95000000
      })
      .setup(p => p.dispose())
      .returns()
      .setup(p => p.on(It.IsAny(), It.IsAny()))
      .returns(() => {})
      .setup(p => p.reportNewSectorsLoaded(It.IsAny()))
      .returns()
      .setup(p => p.addModel(It.IsAny()))
      .returns()
      .setup(p => p.removeModel(It.IsAny()))
      .returns()
      .setup(p => p.updateCamera(It.IsAny(), It.IsAny()))
      .returns()
      .setup(p => (p.clippingPlanes = It.IsAny()))
      .callback(() => {});

    pickCacheInvalidator = new PickCacheInvalidator();
    cadManager = new CadManager(
      materialManagerMock.object(),
      cadModelFactoryMock.object(),
      updateHandlerMock.object(),
      pickCacheInvalidator
    );
  });

  test('should initialize CadManager with proper dependencies', () => {
    expect(cadManager).toBeDefined();
    expect(cadManager).toBeInstanceOf(CadManager);
    expect(cadManager.dispose).toBeDefined();
    expect(cadManager.updateCamera).toBeDefined();
  });

  test('should access budget correctly', () => {
    const budget = cadManager.budget;
    expect(budget).toBeDefined();
    expect(budget.highDetailProximityThreshold).toBe(100);
    expect(budget.maximumRenderCost).toBe(95000000);
  });

  test('should handle camera update correctly', () => {
    // Create a proper PerspectiveCamera instance instead of a mock
    const camera = new PerspectiveCamera(75, 1.0, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.updateMatrixWorld();

    expect(() => cadManager.updateCamera(camera, false)).not.toThrow();
  });

  test('should dispose properly', () => {
    expect(() => cadManager.dispose()).not.toThrow();
    updateHandlerMock.verify(p => p.dispose());
  });

  test('should access material manager correctly', () => {
    expect(cadManager.materialManager).toBe(materialManagerMock.object());
  });

  describe('pick cache invalidation', () => {
    const modelIdentifier = new CdfModelIdentifier(1, 2);

    function setupModelFactory(model: CadNode): void {
      cadModelFactoryMock
        .setup(p => p.loadModelMetadata(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(createMinimalMetadata(File3dFormat.AnyFormat, 9)))
        .setup(p => p.createModel(It.IsAny(), It.IsAny()))
        .returns(model);
      materialManagerMock.setup(p => p.removeModelMaterials(It.IsAny())).returns();
    }

    test('a plain redraw request does not invalidate the pick cache', () => {
      cadManager.requestRedraw();

      expect(cadManager.needsRedraw).toBe(true);
      expect(pickCacheInvalidator.consume()).toBe(false);
    });

    test('adding and removing a model invalidates the pick cache', async () => {
      const sectorRepository = new Mock<SectorRepository>()
        .setup(p => p.setCacheSize(It.IsAny()))
        .returns()
        .setup(p => p.clearCache)
        .returns(() => {})
        .setup(p => p.dereferenceSector)
        .returns(() => {})
        .object();
      const model = createCadNode(2, 2, { pickCacheInvalidator, sectorRepository });
      setupModelFactory(model);

      await cadManager.addModel(modelIdentifier);
      expect(pickCacheInvalidator.consume()).toBe(true);

      cadManager.removeModel(model);
      expect(pickCacheInvalidator.consume()).toBe(true);
    });
  });

  describe('doesModelHaveCompatibleFormat', () => {
    test('returns true when no compatible format has been set yet', () => {
      const metadata = createMinimalMetadata(File3dFormat.GltfCadModel, 9);
      expect(cadManager.doesModelHaveCompatibleFormat(metadata)).toBe(true);
    });

    test('GltfCadModel and GltfPrioritizedNodes are compatible with each other', () => {
      const gltfMetadata = createMinimalMetadata(File3dFormat.GltfCadModel, 9);
      const prioritizedMetadata = createMinimalMetadata(File3dFormat.GltfPrioritizedNodes, 9);

      cadManager.updateModelCompatibilityFormat(gltfMetadata);

      expect(cadManager.doesModelHaveCompatibleFormat(prioritizedMetadata)).toBe(true);
    });

    test('GltfPrioritizedNodes and GltfCadModel are compatible with each other', () => {
      const gltfMetadata = createMinimalMetadata(File3dFormat.GltfCadModel, 9);
      const prioritizedMetadata = createMinimalMetadata(File3dFormat.GltfPrioritizedNodes, 9);

      cadManager.updateModelCompatibilityFormat(prioritizedMetadata);

      expect(cadManager.doesModelHaveCompatibleFormat(gltfMetadata)).toBe(true);
    });
  });
});
