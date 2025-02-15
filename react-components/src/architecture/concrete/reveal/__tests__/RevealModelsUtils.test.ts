/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { cadMock, cadModelOptions } from '../../../../../tests/unit-tests/fixtures/cadModel';
import {
  image360ClassicMock,
  image360ClassicOptions
} from '../../../../../tests/unit-tests/fixtures/image360';
import {
  pointCloudMock,
  pointCloudModelOptions
} from '../../../../../tests/unit-tests/fixtures/pointCloud';
import { renderTargetMock } from '../../../../../tests/unit-tests/fixtures/renderTarget';
import { viewerMock } from '../../../../../tests/unit-tests/fixtures/viewer';
import { sdkMock } from '../../../../../tests/unit-tests/fixtures/sdk';
import { RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { CadDomainObject } from '../cad/CadDomainObject';
import { Image360CollectionDomainObject } from '../Image360Collection/Image360CollectionDomainObject';
import { PointCloudDomainObject } from '../pointCloud/PointCloudDomainObject';
import { RevealModelsUtils } from '../RevealModelsUtils';

describe('RevealModelsUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('getByRevealModel returns correct domain object for CAD model', () => {
    const root = new RootDomainObject(renderTargetMock, sdkMock);
    const cadDomainObject = new CadDomainObject(cadMock);
    root.addChildInteractive(cadDomainObject);

    const result = RevealModelsUtils.getByRevealModel(root, cadMock);
    expect(result).toBe(cadDomainObject);
  });

  test('getByRevealModel returns correct domain object for PointCloud model', () => {
    const root = new RootDomainObject(renderTargetMock, sdkMock);
    const pointCloudDomainObject = new PointCloudDomainObject(pointCloudMock);
    root.addChildInteractive(pointCloudDomainObject);

    const result = RevealModelsUtils.getByRevealModel(root, pointCloudMock);
    expect(result).toBe(pointCloudDomainObject);
  });

  test('getByRevealModel returns correct domain object for Image360Collection', () => {
    const root = new RootDomainObject(renderTargetMock, sdkMock);
    const image360DomainObject = new Image360CollectionDomainObject(image360ClassicMock);
    root.addChildInteractive(image360DomainObject);

    const result = RevealModelsUtils.getByRevealModel(root, image360ClassicMock);
    expect(result).toBe(image360DomainObject);
  });

  test('addModel adds CAD model and returns it', async () => {
    const addCadModelMock = vi.fn().mockResolvedValue(cadMock);
    viewerMock.addCadModel = addCadModelMock;

    const result = await RevealModelsUtils.addModel(renderTargetMock, cadModelOptions);
    expect(result).toBe(cadMock);
    expect(addCadModelMock).toHaveBeenCalledWith(cadModelOptions);
  });

  test('addPointCloud adds PointCloud model and returns it', async () => {
    const addPointCloudModelMock = vi.fn().mockResolvedValue(pointCloudMock);
    viewerMock.addPointCloudModel = addPointCloudModelMock;

    const result = await RevealModelsUtils.addPointCloud(renderTargetMock, pointCloudModelOptions);
    expect(result).toBe(pointCloudMock);
    expect(addPointCloudModelMock).toHaveBeenCalledWith(pointCloudModelOptions);
  });

  test('addImage360Collection adds Image360Collection and returns it', async () => {
    const add360ImageSetMock = vi.fn().mockResolvedValue(image360ClassicMock);
    viewerMock.add360ImageSet = add360ImageSetMock;

    const result = await RevealModelsUtils.addImage360Collection(
      renderTargetMock,
      image360ClassicOptions
    );
    expect(result).toBe(image360ClassicMock);
    const siteId =
      image360ClassicOptions.source === 'events'
        ? image360ClassicOptions.siteId
        : image360ClassicOptions.externalId;
    expect(add360ImageSetMock).toHaveBeenCalledWith(
      'events',
      { site_id: siteId },
      { preMultipliedRotation: false }
    );
  });

  test('remove the model from the root domain object', () => {
    const root = new RootDomainObject(renderTargetMock, sdkMock);
    const cadDomainObject = new CadDomainObject(cadMock);
    root.addChildInteractive(cadDomainObject);

    RevealModelsUtils.remove(renderTargetMock, cadMock);
    expect(root.children.length).toBe(0);
  });
});
