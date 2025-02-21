/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import {
  cadModelOptions,
  createCadMock
} from '../../../../tests/tests-utilities/fixtures/cadModel';
import {
  createImage360ClassicMock,
  image360ClassicOptions
} from '../../../../tests/tests-utilities/fixtures/image360';
import {
  createPointCloudMock,
  pointCloudModelOptions
} from '../../../../tests/tests-utilities/fixtures/pointCloud';
import { createRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/renderTarget';
import { viewerMock } from '../../../../tests/tests-utilities/fixtures/viewer';
import { CadDomainObject } from './cad/CadDomainObject';
import { Image360CollectionDomainObject } from './Image360Collection/Image360CollectionDomainObject';
import { PointCloudDomainObject } from './pointCloud/PointCloudDomainObject';
import { RevealModelsUtils } from './RevealModelsUtils';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';

describe('RevealModelsUtils', () => {
  let renderTargetMock: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    vi.resetAllMocks();
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
    const siteId =
      image360ClassicOptions.source === 'events'
        ? image360ClassicOptions.siteId
        : image360ClassicOptions.externalId;
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
    let domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).not.toBe(undefined);

    RevealModelsUtils.remove(renderTargetMock, model);
    domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBe(undefined);
    expect(removeFn).toHaveBeenCalledWith(model);
  });

  test('should remove the PointCloud model', async () => {
    const model = createPointCloudMock();
    const removeFn = vi.fn().mockResolvedValue(model);
    viewerMock.removeModel = removeFn;
    const addFn = vi.fn().mockResolvedValue(model);
    viewerMock.addPointCloudModel = addFn;

    // Add model
    await RevealModelsUtils.addPointCloud(renderTargetMock, pointCloudModelOptions);
    let domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).not.toBe(undefined);

    RevealModelsUtils.remove(renderTargetMock, model);
    domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBe(undefined);
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
    expect(domainObject).not.toBe(undefined);

    setIconsVisibilityMock.mockImplementation((visible) => {
      getIconsVisibiltyMock.mockReturnValue(visible);
    });
    model.setIconsVisibility(false);
    expect(model.getIconsVisibility()).toEqual(false);

    RevealModelsUtils.remove(renderTargetMock, model);
    domainObject = RevealModelsUtils.getByRevealModel(root, model);
    expect(domainObject).toBe(undefined);
    expect(removeFn).toHaveBeenCalledWith(model);
  });
});
