import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SetFlexibleControlsTypeCommand } from './SetFlexibleControlsTypeCommand';
import { isEmpty } from '../../utilities/translation/TranslateInput';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { FlexibleControlsType } from '@cognite/reveal';
import { count } from '../../utilities/extensions/arrayUtils';
import { type CommandUpdateDelegate } from '../../commands/BaseCommand';

describe(SetFlexibleControlsTypeCommand.name, () => {
  let commands: SetFlexibleControlsTypeCommand[];
  const renderTarget = createFullRenderTargetMock();

  beforeEach(() => {
    // Add 3 SetFlexibleControlsTypeCommands to a array
    commands = [
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit),
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson),
      new SetFlexibleControlsTypeCommand(FlexibleControlsType.OrbitInCenter)
    ];
    for (const command of commands) {
      command.attach(renderTarget);
    }
  });

  test('Should have have correct initial state', () => {
    for (const command of commands) {
      expect(command.icon).not.toBe('');
      expect(isEmpty(command.tooltip)).toBe(false);
      expect(command.isEnabled).toBe(true);
      expect(command.getShortCutKeys()).toBeOneOf([['1'], ['2'], undefined]);
    }
  });

  test('Should have have one checked', () => {
    expect(getCheckedCount()).toBe(1);
  });

  test('Should change the cameraControlsType in RevealSettingsController', () => {
    for (const command of commands) {
      expect(command).toBeDefined();

      if (command.isChecked) {
        continue; // Already check
      }
      const oldValue = renderTarget.revealSettingsController.cameraControlsType();
      expect(command.invoke()).toBe(true);
      const newValue = renderTarget.revealSettingsController.cameraControlsType();
      expect(oldValue).not.toBe(newValue);
      expect(command.isChecked).toBe(true);
      expect(getCheckedCount()).toBe(1);
    }
  });

  test('Should listen when cameraControlsType change in RevealSettingsController', () => {
    const command = new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson);
    command.attach(renderTarget);

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

  function getCheckedCount(): number {
    return count(commands, (command) => command.isChecked);
  }
});
