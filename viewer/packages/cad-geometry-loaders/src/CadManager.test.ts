/*!
 * Copyright 2025 Cognite AS
 */
import { CadManager } from './CadManager';
import { CadMaterialManager } from '@reveal/rendering';
import { CadModelFactory } from '@reveal/cad-model';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { EMPTY } from 'rxjs';
import { It, Mock, IMock } from 'moq.ts';
import { PerspectiveCamera } from 'three';

describe(CadManager.name, () => {
  let cadManager: CadManager;
  let materialManagerMock: IMock<CadMaterialManager>;
  let cadModelFactoryMock: IMock<CadModelFactory>;
  let updateHandlerMock: IMock<CadModelUpdateHandler>;

  beforeEach(() => {
    materialManagerMock = new Mock<CadMaterialManager>()
      .setup(p => p.on(It.IsAny(), It.IsAny()))
      .returns()
      .setup(p => p.off(It.IsAny(), It.IsAny()))
      .returns()
      .setup(p => p.dispose())
      .returns();

    cadModelFactoryMock = new Mock<CadModelFactory>().setup(p => p.dispose()).returns();

    updateHandlerMock = new Mock<CadModelUpdateHandler>()
      .setup(p => p.budget)
      .returns({
        highDetailProximityThreshold: 100,
        maximumRenderCost: 95000000
      })
      .setup(p => p.consumedSectorObservable())
      .returns(EMPTY)
      .setup(p => p.getLoadingStateObserver())
      .returns(EMPTY)
      .setup(p => p.dispose())
      .returns()
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

    cadManager = new CadManager(materialManagerMock.object(), cadModelFactoryMock.object(), updateHandlerMock.object());
  });

  test('should initialize CadManager with proper dependencies', () => {
    expect(cadManager).toBeDefined();
    expect(cadManager).toBeInstanceOf(CadManager);
    expect(cadManager.dispose).toBeDefined();
    expect(cadManager.updateCamera).toBeDefined();
  });

  test('should register materials changed listener on initialization', () => {
    materialManagerMock.verify(p => p.on('materialsChanged', It.IsAny()));
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
    materialManagerMock.verify(p => p.off('materialsChanged', It.IsAny()));
  });

  test('should access material manager correctly', () => {
    expect(cadManager.materialManager).toBe(materialManagerMock.object());
  });
});
