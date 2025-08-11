import { beforeEach, describe, expect, test } from 'vitest';
import { PointCloudDomainObject } from './PointCloudDomainObject';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { PointColorType, PointShape, type CognitePointCloudModel } from '@cognite/reveal';
import { viewerModelsMock } from '#test-utils/fixtures/viewer';

describe(PointCloudDomainObject.name, () => {
  let model: CognitePointCloudModel;
  let domainObject: PointCloudDomainObject;
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    model = createPointCloudMock({ visible: false });
    domainObject = new PointCloudDomainObject(model);
    renderTarget = createFullRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);
  });

  test('has expected default values', () => {
    expect(domainObject.model).toBe(model);
    expect(domainObject.typeName).toEqual({ untranslated: 'PointCloud' });
    expect(domainObject.icon).toEqual('PointCloud');
    expect(domainObject.hasIconColor).toEqual(false);
  });

  test('should be removed', () => {
    viewerModelsMock.mockReturnValue([model]);
    domainObject.removeInteractive();
    expect(renderTarget.viewer.removeModel).toHaveBeenCalledWith(model);
  });

  test('should be set visible', () => {
    expect(domainObject.isVisible()).toBe(false);
    expect(model.visible).toBe(false);
    expect(renderTarget.viewer.requestRedraw).not.toHaveBeenCalled();

    domainObject.setVisibleInteractive(true);

    expect(domainObject.isVisible()).toBe(true);
    expect(model.visible).toBe(true);
    expect(renderTarget.viewer.requestRedraw).toHaveBeenCalled();
  });

  test('should set point size', () => {
    const expectedValue = 5;
    expect(model.pointSize).not.toBe(expectedValue);
    domainObject.pointSize(expectedValue);
    expect(model.pointSize).toBe(expectedValue);
  });

  test('should set point shape', () => {
    const expectedValue = PointShape.Paraboloid;
    expect(model.pointShape).not.toBe(expectedValue);
    domainObject.pointShape(expectedValue);
    expect(model.pointShape).toBe(expectedValue);
  });

  test('should set point color type', () => {
    const expectedValue = PointColorType.Intensity;
    expect(model.pointColorType).not.toBe(expectedValue);
    domainObject.pointColorType(expectedValue);
    expect(model.pointColorType).toBe(expectedValue);
  });
});
