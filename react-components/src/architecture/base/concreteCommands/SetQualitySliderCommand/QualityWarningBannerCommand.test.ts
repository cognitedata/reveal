import { beforeEach, describe, expect, test } from 'vitest';
import { QualityWarningBannerCommand } from './QualityWarningBannerCommand';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { type FidelityLevel, getQualityForFidelityLevel, MAX_FIDELITY } from './fidelityLevels';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';
import { BannerStatus } from '../../commands/BaseBannerCommand';
import { isTranslatedString } from '../../utilities/TranslateInput';

describe(QualityWarningBannerCommand.name, () => {
  let renderTargetMock: RevealRenderTarget;
  let command: QualityWarningBannerCommand;

  beforeEach(() => {
    renderTargetMock = createRenderTargetMock();
    command = new QualityWarningBannerCommand();
    command.attach(renderTargetMock);
  });

  test('should be visible with content and warning status on high fidelity level', () => {
    renderTargetMock.revealSettingsController.renderQuality(
      getQualityForFidelityLevel(MAX_FIDELITY)
    );

    expect(command.isVisible).toBeTruthy();
    expect(isTranslatedString(command.content)).toBeTruthy();
    expect(command.status).toBe(BannerStatus.Warning);
  });

  test('should be invisible on any lower fidelity level', () => {
    renderTargetMock.revealSettingsController.renderQuality(
      getQualityForFidelityLevel((MAX_FIDELITY - 1) as FidelityLevel)
    );

    expect(command.isVisible).toBeFalsy();
  });
});
