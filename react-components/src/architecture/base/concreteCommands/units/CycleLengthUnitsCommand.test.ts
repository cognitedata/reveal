import { beforeEach, describe, expect, test } from 'vitest';
import { CycleLengthUnitsCommand } from './CycleLengthUnitsCommand';
import { isEmpty } from '../../utilities/TranslateInput';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';
import { Changes } from '../../domainObjectsHelpers/Changes';
import { EventChangeTester } from '#test-utils/architecture/EventChangeTester';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { LengthUnit } from '../../renderTarget/UnitSystem';

describe(CycleLengthUnitsCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: CycleLengthUnitsCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    command = new CycleLengthUnitsCommand();
    command.attach(renderTarget);
  });

  test('Should have have tooltip, icon, toggle, checked and enable', async () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('RulerAlternative');
    expect(command.isEnabled).toBe(true);
  });

  test('should switch from metric unit and imperial', async () => {
    const unitSystem = renderTarget.rootDomainObject.unitSystem;

    // Check initial state
    expect(unitSystem.lengthUnit).toBe(LengthUnit.Meter);

    // Toggle it and check the new state
    expect(command.invoke()).toBe(true);
    expect(unitSystem.lengthUnit).toBe(LengthUnit.Feet);

    // Toggle it again and check the new state
    expect(command.invoke()).toBe(true);
    expect(unitSystem.lengthUnit).toBe(LengthUnit.Inch);

    // Toggle it again and check the new state
    expect(command.invoke()).toBe(true);
    expect(unitSystem.lengthUnit).toBe(LengthUnit.Meter);
  });

  test('should toggle between metric and imperial units and notify domain objects twice', async () => {
    const tester = new EventChangeTester(renderTarget.rootDomainObject, Changes.unit);

    expect(command.invoke()).toBe(true);

    // Test that the unit system is notified
    tester.toHaveBeenCalledTimes(1);
  });
});
