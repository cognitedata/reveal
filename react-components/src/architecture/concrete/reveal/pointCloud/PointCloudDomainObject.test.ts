import { describe, expect, test, vi } from 'vitest';
import { PointCloudDomainObject } from './PointCloudDomainObject';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';
import { PointCloudRenderStyle } from './PointCloudRenderStyle';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';

describe(PointCloudDomainObject.name, () => {
  test('has expected default values', () => {
    const model = createPointCloudMock();
    const domainObject = new PointCloudDomainObject(model);

    expect(domainObject.model).toBe(model);
    expect(domainObject.typeName).toEqual({ untranslated: 'PointCloud' });
    expect(domainObject.icon).toEqual('PointCloud');
    expect(domainObject.hasIconColor).toEqual(false);
    expect(domainObject.createRenderStyle()).toBeInstanceOf(PointCloudRenderStyle);
  });

  test('should register event listeners for entering and exiting, which calls the command updater', async () => {
    const model = createPointCloudMock();
    const domainObject = new PointCloudDomainObject(model);

    const renderTarget = createFullRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);
    domainObject.removeInteractive();
    expect(renderTarget.viewer.removeModel).toHaveBeenCalledWith(model);
  });
});
