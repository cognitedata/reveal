import { beforeEach, describe, expect, test } from 'vitest';
import { SetQualitySliderCommand } from './SetQualitySliderCommand';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { FIDELITY_LEVELS, getQualityForFidelityLevel } from './fidelityLevels';

describe(SetQualitySliderCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: SetQualitySliderCommand;

  beforeEach(() => {
    renderTarget = createRenderTargetMock();
    command = new SetQualitySliderCommand();
    command.attach(renderTarget);
  });

  test('contains the value set on the render settings', () => {
    const testFidelityLevel = 3;
    const testQualitySetting = getQualityForFidelityLevel(testFidelityLevel);

    expect(command.value).not.toEqual(testQualitySetting);

    renderTarget.revealSettingsController.renderQuality(testQualitySetting);

    expect(command.value).toEqual(testFidelityLevel);
  });

  test('sets the value on render settings when updated', () => {
    const testFidelityLevel = 3;
    const testQualitySetting = getQualityForFidelityLevel(testFidelityLevel);

    expect(renderTarget.revealSettingsController.renderQuality()).not.toEqual(testQualitySetting);

    command.value = testFidelityLevel;

    expect(renderTarget.revealSettingsController.renderQuality()).toEqual(testQualitySetting);
  });

  test('ignores invalid inputs', () => {
    const originalQuality = renderTarget.revealSettingsController.renderQuality();

    command.value = 100;

    expect(renderTarget.revealSettingsController.renderQuality()).toEqual(originalQuality);
  });

  test('contains a mark for every fidelity level', () => {
    FIDELITY_LEVELS.forEach((level) => {
      expect(command.marks?.[level]).toBeDefined();
    });
  });
});
