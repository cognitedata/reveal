/*!
 * Copyright 2025 Cognite AS
 */
import { assert, beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { KeyboardSpeedCommand } from './KeyboardSpeedCommand';
import { first, last } from 'lodash';

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
    expect(command.children).toBeDefined();
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

  test('Should check the last option, and the the first option', () => {
    const [lastOption, firstOption] = [last(command.children), first(command.children)];
    expect(firstOption).not.toBe(lastOption);

    for (const option of [lastOption, firstOption]) {
      expect(option).toBeDefined();
      assert(option !== undefined);

      if (option.isChecked) {
        continue; // Already check
      }
      const oldKeyboardSpeed = renderTarget.revealSettingsController.cameraKeyBoardSpeed();
      expect(option.invoke()).toBe(true);
      const newKeyboardSpeed = renderTarget.revealSettingsController.cameraKeyBoardSpeed();
      expect(oldKeyboardSpeed).not.toBe(newKeyboardSpeed);
      expect(option.isChecked).toBe(true);
      expect(command.checkedCount).toBe(1);
      expect(command.selectedChild).toBe(option);
    }
  });
});
