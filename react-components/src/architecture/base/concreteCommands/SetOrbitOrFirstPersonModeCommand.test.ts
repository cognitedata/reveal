import { assert, beforeEach, describe, expect, test, vi } from 'vitest';
import { isEmpty } from '../utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { SetOrbitOrFirstPersonModeCommand } from './SetOrbitOrFirstPersonModeCommand';
import { FlexibleControlsType } from '@cognite/reveal';

describe(SetOrbitOrFirstPersonModeCommand.name, () => {
  let command: SetOrbitOrFirstPersonModeCommand;
  const renderTarget = createFullRenderTargetMock();

  beforeEach(() => {
    command = new SetOrbitOrFirstPersonModeCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
    expect(command.isToggle).toBe(false);
    expect(command.isChecked).toBe(false);
    expect(command.hasChildren).toBe(true);
  });

  test('Should have one of the options checked', () => {
    expect(command.checkedCount).toBe(1);
    expect(command.selectedChild).toBeDefined();
  });

  test('Should listen when cameraControlsType change in RevealSettingsController', () => {
    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.Orbit);

    const mock = vi.fn();
    command.addEventListener(mock);

    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.FirstPerson);
    expect(mock).toHaveBeenCalledOnce();
    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.FirstPerson);
    expect(mock).toHaveBeenCalledOnce(); // No change
    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.Orbit);
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
