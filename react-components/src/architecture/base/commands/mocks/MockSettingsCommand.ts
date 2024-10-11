/*!
 * Copyright 2024 Cognite AS
 */

import { BaseSettingsCommand } from '../BaseSettingsCommand';
import { MockActionCommand } from './MockActionCommand';
import { MockToggleCommand } from './MockToggleCommand';
import { MockCheckableCommand } from './MockCheckableCommand';
import { MockEnumOptionCommand } from './MockEnumOptionCommand';
import { MockSliderCommand } from './MockSliderCommand';
import { MockFilterCommand } from './MockFilterCommand';
import { MockNumberOptionCommand } from './MockNumberOptionCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';
import { type IconName } from '../../utilities/IconName';

export class MockSettingsCommand extends BaseSettingsCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  constructor() {
    super();
    this.addCommand(new MockToggleCommand());
    this.addCommand(new MockSliderCommand());
    this.addCommand(new MockEnumOptionCommand());
    this.addCommand(new MockNumberOptionCommand());
    this.addCommand(new MockActionCommand());
    this.addCommand(new MockCheckableCommand());
    this.addCommand(new MockFilterCommand());
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Mock Settings' };
  }

  public override get icon(): IconName | undefined {
    return 'Bug';
  }
}
