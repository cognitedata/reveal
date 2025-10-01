import { POINT_SIZES, SetPointSizeCommand } from './SetPointSizeCommand';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../../base/utilities/translation/TranslateInput';
import { PointCloudDomainObject } from '../PointCloudDomainObject';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';

describe(SetPointSizeCommand.name, () => {
  let command: SetPointSizeCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new PointCloudDomainObject(createPointCloudMock());
  renderTarget.root.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new SetPointSizeCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have the same value as the point cloud', () => {
    expect(command.pointSize).toBe(domainObject.pointSize());
  });

  test('Should change pointSize at the point cloud', () => {
    const expectedValue = 3;
    expect(domainObject.pointSize()).not.toBe(expectedValue);
    command.pointSize = expectedValue;
    expect(domainObject.pointSize()).toBe(expectedValue);
  });

  test('Should get and set index value', () => {
    command.value = 2;
    expect(command.value).toBe(2);
  });

  test('Should set point size index outside the legal values', () => {
    command.pointSize = POINT_SIZES[5] + 0.0001;
    expect(command.value).toBe(5);
    command.pointSize = POINT_SIZES[5] - 0.0001;
    expect(command.value).toBe(5);
  });

  test('Should get correct value label at minimum point size', () => {
    command.value = 0;
    expect(command.getValueLabel()).toBe('Minimum');
  });

  test('Should get correct value label at other point size then minimum', () => {
    command.value = 5;
    expect(command.getValueLabel()).toBe(POINT_SIZES[5].toString());
  });
});
