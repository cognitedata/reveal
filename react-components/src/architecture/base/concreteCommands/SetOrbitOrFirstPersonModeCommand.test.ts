import { beforeEach, describe, expect, test, vi } from 'vitest';
import { isEmpty } from '../utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { SetOrbitOrFirstPersonModeCommand } from './SetOrbitOrFirstPersonModeCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { type CommandUpdateDelegate } from '../commands/BaseCommand';

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

    const mockEventListener = vi.fn<CommandUpdateDelegate>();
    command.addEventListener(mockEventListener);

    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.FirstPerson);
    expect(mockEventListener).toHaveBeenCalledOnce();
    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.FirstPerson);
    expect(mockEventListener).toHaveBeenCalledOnce(); // No change
    renderTarget.revealSettingsController.cameraControlsType(FlexibleControlsType.Orbit);
    expect(mockEventListener).toHaveBeenCalledTimes(2);
  });
});
