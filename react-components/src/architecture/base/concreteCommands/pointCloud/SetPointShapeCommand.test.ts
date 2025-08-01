import { SetPointShapeCommand } from './SetPointShapeCommand';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { assert, beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../utilities/TranslateInput';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';

describe(SetPointShapeCommand.name, () => {
  let command: SetPointShapeCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new PointCloudDomainObject(createPointCloudMock()); // Uncomment and use if needed
  renderTarget.rootDomainObject.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new SetPointShapeCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have have options with correct initial state', () => {
    expect(command.hasChildren).toBe(true);
    assert(command.children !== undefined);
    expect(command.children.length).greaterThan(1);

    for (const child of command.children) {
      expect(child.isEnabled).toBe(true);
      expect(isEmpty(child.tooltip)).toBe(false);
    }
  });

  test('Should have one of the options checked', () => {
    expect(command.checkedCount).toBe(1);
    expect(command.selectedChild).toBeDefined();
  });

  test('Should change the pointShape on the point cloud', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      if (option.isChecked) {
        continue; // Already check
      }
      const oldValue = domainObject.pointShape();
      expect(option.invoke()).toBe(true);
      const newValue = domainObject.pointShape();
      expect(oldValue).not.toBe(newValue);
      expect(option.isChecked).toBe(true);
      expect(command.checkedCount).toBe(1);
      expect(command.selectedChild).toBe(option);
    }
  });
});
