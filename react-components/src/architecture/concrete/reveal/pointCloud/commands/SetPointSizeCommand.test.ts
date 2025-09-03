import { SetPointSizeCommand } from './SetPointSizeCommand';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../../base/utilities/translation/TranslateInput';
import { PointCloudDomainObject } from '../PointCloudDomainObject';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';

describe(SetPointSizeCommand.name, () => {
  let command: SetPointSizeCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new PointCloudDomainObject(createPointCloudMock());
  renderTarget.rootDomainObject.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new SetPointSizeCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have the same value as the point cloud', () => {
    expect(command.value).toBe(domainObject.pointSize());
  });

  test('Should change pointSize at the point cloud', () => {
    const expectedValue = 3;
    expect(domainObject.pointSize()).not.toBe(expectedValue);
    command.value = expectedValue;
    expect(domainObject.pointSize()).toBe(expectedValue);
  });
});
