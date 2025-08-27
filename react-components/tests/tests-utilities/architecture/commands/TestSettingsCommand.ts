import { BaseSettingsCommand, type TranslationInput } from '../../../../src/architecture';
import { type IconName } from '../../../../src/architecture/base/utilities/types';

export class TestSettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Test settings' };
  }

  public override get icon(): IconName {
    return 'Settings';
  }
}
