import { beforeEach, describe, expect, test } from 'vitest';
import { ToggleMetricUnitsCommand } from './ToggleMetricUnitsCommand';
import { isEmpty } from '../utilities/TranslateInput';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { Changes } from '../domainObjectsHelpers/Changes';
import { EventChangeTester } from '#test-utils/architecture/EventChangeTester';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';

describe(ToggleMetricUnitsCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: ToggleMetricUnitsCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    command = new ToggleMetricUnitsCommand();
    command.attach(renderTarget);
  });

  test('Should have have tooltip, icon, toggle, checked and enable', async () => {
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

  test('should toggle between metric and imperial units and notify domain objects twice', async () => {
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
