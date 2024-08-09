/*!
 * Copyright 2024 Cognite AS
 */

import { MockActionCommand } from './MockActionCommand';
import { MockToggleCommand } from './MockToggleCommand';
import { MockCheckableCommand } from './MockCheckableCommand';
import { MockEnumOptionCommand } from './MockEnumOptionCommand';
import { MockSliderCommand } from './MockSliderCommand';
import { SettingsCommand } from '../SettingsCommand';
import { MockFilterCommand } from './MockFilterCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';
import { MockNumberOptionCommand } from './MockNumberOptionCommand';

export class MockSettingsCommand extends SettingsCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  constructor() {
    super();
    this.add(new MockToggleCommand());
    this.add(new MockSliderCommand());
    this.add(new MockEnumOptionCommand());
    this.add(new MockNumberOptionCommand());
    this.add(new MockActionCommand());
    this.add(new MockCheckableCommand());
    this.add(new MockFilterCommand());
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Mock Settings' };
  }

  public override get icon(): string | undefined {
    return 'Bug';
  }
}
