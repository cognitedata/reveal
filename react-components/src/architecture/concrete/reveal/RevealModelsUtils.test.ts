import { describe, expect, test, vi, beforeEach } from 'vitest';
import { cadModelOptions, createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock, image360ClassicOptions } from '#test-utils/fixtures/image360';
import { createPointCloudMock, pointCloudModelOptions } from '#test-utils/fixtures/pointCloud';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { viewerMock, viewerModelsMock } from '#test-utils/fixtures/viewer';
import { CadDomainObject } from './cad/CadDomainObject';
import { Image360CollectionDomainObject } from './Image360Collection/Image360CollectionDomainObject';
import { PointCloudDomainObject } from './pointCloud/PointCloudDomainObject';
import { RevealModelsUtils } from './RevealModelsUtils';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';

describe(RevealModelsUtils.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTargetMock = createRenderTargetMock();
    root = renderTargetMock.rootDomainObject;
  });

  test('should get CadDomainObject', () => {
    const model = createCadMock();
    const domainObject = new CadDomainObject(model);
    root.addChildInteractive(domainObject);

    const result = RevealModelsUtils.getByRevealModel(root, model);
    expect(result).toBe(domainObject);
  });

  test('should get PointCloudDomainObject', () => {
    const model = createPointCloudMock();
    const domainObject = new PointCloudDomainObject(model);
    root.addChildInteractive(domainObject);

    const result = RevealModelsUtils.getByRevealModel(root, model);
    expect(result).toBe(domainObject);
  });

  test('should get Image360CollectionDomainObject', () => {
    const model = createImage360ClassicMock();
    const domainObject = new Image360CollectionDomainObject(model);
    root.addChildInteractive(domainObject);

    const result = RevealModelsUtils.getByRevealModel(root, model);
    expect(result).toBe(domainObject);
  });

  test('should add CAD model', async () => {
    const model = createCadMock();
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addCadModel = addFn;

    const result = await RevealModelsUtils.addModel(renderTargetMock, cadModelOptions);
    expect(result).toBe(model);
    expect(addFn).toHaveBeenCalledWith(cadModelOptions);
  });

  test('should add PointCloud model', async () => {
    const model = createPointCloudMock();
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addPointCloudModel = addFn;

    const result = await RevealModelsUtils.addPointCloud(renderTargetMock, pointCloudModelOptions);
    expect(result).toBe(model);
    expect(addFn).toHaveBeenCalledWith(pointCloudModelOptions);
  });

  test('should add Image360Collection', async () => {
    const model = createImage360ClassicMock();
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.add360ImageSet = addFn;

    const result = await RevealModelsUtils.addImage360Collection(
      renderTargetMock,
      image360ClassicOptions
    );
    expect(result).toBe(model);
    const siteId = image360ClassicOptions.siteId;
    expect(addFn).toHaveBeenCalledWith(
      'events',
      { site_id: siteId },
      { preMultipliedRotation: false }
    );
  });

  test('should remove the CAD model', async () => {
    const model = createCadMock();
    const removeFn = vi.fn().mockResolvedValue(model);
    viewerMock.removeModel = removeFn;
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addCadModel = addFn;

    // Add model
    await RevealModelsUtils.addModel(renderTargetMock, cadModelOptions);

    viewerModelsMock.mockReturnValue([model]);

    let domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBeDefined();

    RevealModelsUtils.remove(renderTargetMock, model);
    domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBeUndefined();
    expect(removeFn).toHaveBeenCalledWith(model);
  });

  test('should not throw when removing a non-existing CAD model', async () => {
    const model = createCadMock();
    const removeFn = vi.fn().mockImplementation(() => {
      throw new Error();
    });
    viewerMock.removeModel = removeFn;
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addCadModel = addFn;

    viewerModelsMock.mockReturnValue([]);

    await RevealModelsUtils.addModel(renderTargetMock, cadModelOptions);

    expect(() => {
      RevealModelsUtils.remove(renderTargetMock, model);
    }).not.toThrow();
  });

  test('should not throw when removing a non-existing Point Cloud model', async () => {
    const model = createPointCloudMock();
    const removeFn = vi.fn().mockImplementation(() => {
      throw new Error();
    });
    viewerMock.removeModel = removeFn;
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addPointCloudModel = addFn;

    viewerModelsMock.mockReturnValue([]);

    await RevealModelsUtils.addPointCloud(renderTargetMock, pointCloudModelOptions);

    expect(() => {
      RevealModelsUtils.remove(renderTargetMock, model);
    }).not.toThrow();
  });

  test('should remove the PointCloud model', async () => {
    const model = createPointCloudMock();
    const removeFn = vi.fn().mockResolvedValue(model);
    viewerMock.removeModel = removeFn;
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addPointCloudModel = addFn;

    // Add model
    await RevealModelsUtils.addPointCloud(renderTargetMock, pointCloudModelOptions);

    viewerModelsMock.mockReturnValue([model]);

    let domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBeDefined();

    RevealModelsUtils.remove(renderTargetMock, model);
    domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBeUndefined();
    expect(removeFn).toHaveBeenCalledWith(model);
  });

  test('should remove the Image360Collection model', async () => {
    const model = createImage360ClassicMock();
    const removeFn = vi.fn().mockResolvedValue(model);
    viewerMock.remove360ImageSet = removeFn;
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.add360ImageSet = addFn;

    // Add model
    await RevealModelsUtils.addImage360Collection(renderTargetMock, image360ClassicOptions);
    let domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBeDefined();

    RevealModelsUtils.remove(renderTargetMock, model);
    domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBeUndefined();
    expect(removeFn).toHaveBeenCalledWith(model);
  });
});
