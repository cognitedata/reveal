import { beforeEach, describe, expect, test } from 'vitest';
import { ToggleMetricUnitsCommand } from './ToggleMetricUnitsCommand';
import { isEmpty } from '../utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { Changes } from '../domainObjectsHelpers/Changes';
import { EventChangeTester } from '#test-utils/architecture/EventChangeTester';

describe(ToggleMetricUnitsCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: ToggleMetricUnitsCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    command = new ToggleMetricUnitsCommand();
    command.attach(renderTarget);
  });

  test('should have following default behavior', async () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('RulerAlternative');
    expect(command.isToggle).toBe(true);
    expect(command.isChecked).toBe(true);
    expect(command.isEnabled).toBe(true);
  });

  test('should switch from metric unit and imperial', async () => {
    // Check initial state
    expect(renderTarget.rootDomainObject.unitSystem.isMetric).toBe(true);
    expect(command.isChecked).toBe(true);

    // Toggle it
    expect(command.invoke()).toBe(true);

    // Check new state
    expect(command.isChecked).toBe(false);
    expect(renderTarget.rootDomainObject.unitSystem.isMetric).toBe(false);
  });

  test('should switch from metric unit and imperial and back and check if domain objects are notified twice', async () => {
    const tester = new EventChangeTester(renderTarget.rootDomainObject, Changes.unit);

    expect(command.isChecked).toBe(true);
    expect(command.invoke()).toBe(true);
    expect(command.isChecked).toBe(false);
    expect(command.invoke()).toBe(true);
    expect(command.isChecked).toBe(true);

    // Test that the unit system is notified
    tester.toHaveBeenCalledTimes(2);
  });
});
