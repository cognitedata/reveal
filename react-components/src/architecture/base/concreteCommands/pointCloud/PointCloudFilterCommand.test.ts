import { assert, describe, expect, test, beforeEach } from 'vitest';
import { PointCloudFilterCommand } from './PointCloudFilterCommand';
import { isOdd } from '../../utilities/extensions/mathUtils';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import {
  createPointCloudMock,
  pointCloudClasses
} from '../../../../../tests/tests-utilities/fixtures/pointCloud';
import { count } from '../../utilities/extensions/arrayUtils';

describe(PointCloudFilterCommand.name, () => {
  let command: PointCloudFilterCommand;

  beforeEach(() => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = new PointCloudDomainObject(createPointCloudMock());
    renderTarget.rootDomainObject.addChildInteractive(domainObject);

    command = new PointCloudFilterCommand();
    command.attach(renderTarget);
    command.initializeChildrenIfNeeded();
  });

  test('should have children', () => {
    assert(command.children !== undefined);
    expect(command.children).toHaveLength(classesCount());
    expect(command.children).toHaveLength(6);
  });

  test('should have none checked', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(false);
    }
    expect(visibleCount()).toBe(0);
    expect(command.isAllChecked).toBe(false);
    expect(command.isSomeChecked).toBe(false);
  });

  test('should have some checked', () => {
    assert(command.children !== undefined);
    let childIndex = 0;
    for (const option of command.children) {
      option.setChecked(isOdd(childIndex));
      childIndex++;
    }
    expect(command.isAllChecked).toBe(false);
    expect(command.isSomeChecked).toBe(true);
    expect(visibleCount()).greaterThan(0);
    expect(visibleCount()).lessThan(classesCount());
  });

  test('should have all checked', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(true);
    }
    expect(command.isAllChecked).toBe(true);
    expect(command.isSomeChecked).toBe(true);
    expect(visibleCount()).toBe(classesCount());
  });

  test('should have label and color at all options', () => {
    assert(command.children !== undefined);
    for (let i = 0; i < command.children.length; i++) {
      const option = command.children[i];
      expect(option.label).toBe(pointCloudClasses[i].name);
      expect(option.color).toBe(pointCloudClasses[i].color);
    }
  });
  test('should be checked after invoke', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(false); // To be sure that is in not checked fore invoke
      expect(option.isChecked).toBe(false);
      option.invoke();
      expect(option.isChecked).toBe(true);
    }
  });
});

function visibleCount(): number {
  return count(pointCloudClasses, (item) => item.hasClass && item.visible);
}

function classesCount(): number {
  return count(pointCloudClasses, (item) => item.hasClass);
}
