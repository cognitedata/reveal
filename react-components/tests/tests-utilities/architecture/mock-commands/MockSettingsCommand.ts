import { type TranslationInput } from '../../../../src/architecture/base/utilities/TranslateInput';
import { type IconName } from '../../../../src/architecture/base/utilities/IconName';

import { BaseSettingsCommand } from '../../../../src/architecture/base/commands/BaseSettingsCommand';
import { MockActionCommand } from './MockActionCommand';
import { MockToggleCommand } from './MockToggleCommand';
import { MockCheckableCommand } from './MockCheckableCommand';
import { MockEnumOptionCommand } from './MockEnumOptionCommand';
import { MockSliderCommand } from './MockSliderCommand';
import { MockFilterCommand } from './MockFilterCommand';
import { MockNumberOptionCommand } from './MockNumberOptionCommand';
import { MockSectionCommand } from './MockSectionCommand';
import { DividerCommand } from '../../../../src/architecture/base/commands/DividerCommand';

export class MockSettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  constructor() {
    super();
    this.add(new MockToggleCommand());
    this.add(new MockEnumOptionCommand());
    this.add(new MockNumberOptionCommand());
    this.add(new MockActionCommand());
    this.add(new MockCheckableCommand());
    this.add(new MockFilterCommand());

    this.add(new DividerCommand());
    this.add(new MockSectionCommand());
    this.add(new MockSliderCommand());
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Mock Settings' };
  }

  public override get icon(): IconName {
    return 'Bug';
  }
}
