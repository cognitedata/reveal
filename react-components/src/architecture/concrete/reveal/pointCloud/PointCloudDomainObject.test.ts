import { beforeEach, describe, expect, test } from 'vitest';
import { PointCloudDomainObject } from './PointCloudDomainObject';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';
import { PointCloudRenderStyle } from './PointCloudRenderStyle';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { type CognitePointCloudModel } from '@cognite/reveal';

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
    expect(domainObject.createRenderStyle()).toBeInstanceOf(PointCloudRenderStyle);
  });

  test('should be removed', async () => {
    domainObject.removeInteractive();
    expect(renderTarget.viewer.removeModel).toHaveBeenCalledWith(model);
  });

  test('should be set visible', async () => {
    expect(domainObject.isVisible()).toBe(false);
    expect(model.visible).toBe(false);
    expect(renderTarget.viewer.requestRedraw).not.toHaveBeenCalled();

    domainObject.setVisibleInteractive(true);

    expect(domainObject.isVisible()).toBe(true);
    expect(model.visible).toBe(true);
    expect(renderTarget.viewer.requestRedraw).toHaveBeenCalled();
  });
});
