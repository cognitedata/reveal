import { assert, beforeEach, describe, expect, test, vi } from 'vitest';
import { isEmpty } from '../utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { KeyboardSpeedCommand } from './KeyboardSpeedCommand';

describe(KeyboardSpeedCommand.name, () => {
  let command: KeyboardSpeedCommand;
  const renderTarget = createFullRenderTargetMock();

  beforeEach(() => {
    command = new KeyboardSpeedCommand();
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

  test('Should change the cameraKeyBoardSpeed in RevealSettingsController', () => {
    assert(command.children !== undefined);
    for (const option of command.children) {
      expect(option).toBeDefined();
      assert(option !== undefined);

      if (option.isChecked) {
        continue; // Already check
      }
      const oldValue = renderTarget.revealSettingsController.cameraKeyBoardSpeed();
      expect(option.invoke()).toBe(true);
      const newValue = renderTarget.revealSettingsController.cameraKeyBoardSpeed();
      expect(oldValue).not.toBe(newValue);
      expect(option.isChecked).toBe(true);
      expect(command.checkedCount).toBe(1);
      expect(command.selectedChild).toBe(option);
    }
  });

  test('Should listen when cameraKeyBoardSpeed change in RevealSettingsController', () => {
    renderTarget.revealSettingsController.cameraKeyBoardSpeed(1);

    const mock = vi.fn();
    command.addEventListener(mock);

    renderTarget.revealSettingsController.cameraKeyBoardSpeed(2);
    expect(mock).toHaveBeenCalledOnce();
    renderTarget.revealSettingsController.cameraKeyBoardSpeed(2);
    expect(mock).toHaveBeenCalledOnce(); // No change
    renderTarget.revealSettingsController.cameraKeyBoardSpeed(3);
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
