/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { ToggleMetricUnitsCommand } from './ToggleMetricUnitsCommand';
import { isEmpty } from '../utilities/TranslateInput';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';

describe(ToggleMetricUnitsCommand.name, () => {
  let command: ToggleMetricUnitsCommand;
  const renderTarget = createFullRenderTargetMock();

  beforeEach(() => {
    command = new ToggleMetricUnitsCommand();
    command.attach(renderTarget);
  });

  test('Should have have icons, tooltip and toggle', () => {
    expect(command.icon).not.toBe('');
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isToggle).toBe(true);
  });

  test('Should toggle between metric and ft', () => {
    // Check initial state
    expect(renderTarget.rootDomainObject.unitSystem.isMetric).toBe(true);
    expect(command.isChecked).toBe(true);

    // Toggle it
    expect(command.invoke()).toBe(true);

    // Check new state
    expect(command.isChecked).toBe(false);
    expect(renderTarget.rootDomainObject.unitSystem.isMetric).toBe(false);
  });
});
