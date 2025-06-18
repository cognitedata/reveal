import { assert, beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../utilities/TranslateInput';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { SetLengthUnitCommand } from './SetLengthUnitCommand';
import { EventChangeTester } from '../../../../../tests/tests-utilities/architecture/EventChangeTester';
import { Changes } from '../../domainObjectsHelpers/Changes';

describe(SetLengthUnitCommand.name, () => {
  const renderTarget = createFullRenderTargetMock();
  let command: SetLengthUnitCommand;

  beforeEach(() => {
    command = new SetLengthUnitCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
    expect(command.isToggle).toBe(false);
    expect(command.isChecked).toBe(false);
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

  test('Should change the unit', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      if (option.isChecked) {
        continue; // Already check
      }
      const unitSystem = renderTarget.rootDomainObject.unitSystem;
      const oldValue = unitSystem.lengthUnit;
      expect(option.invoke()).toBe(true);
      const newValue = unitSystem.lengthUnit;
      expect(oldValue).not.toBe(newValue);
      expect(option.isChecked).toBe(true);
      expect(command.checkedCount).toBe(1);
      expect(command.selectedChild).toBe(option);
    }
  });

  test('Should notify when unit change', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      if (option.isChecked) {
        continue; // Already check
      }
      const tester = new EventChangeTester(renderTarget.rootDomainObject, Changes.unit);
      expect(option.invoke()).toBe(true);
      tester.toHaveBeenCalledOnce();
    }
  });
});
