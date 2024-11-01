/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../utilities/TranslateKey';
import { type IconName } from '../../utilities/IconName';

import { BaseSettingsCommand } from '../BaseSettingsCommand';
import { MockActionCommand } from './MockActionCommand';
import { MockToggleCommand } from './MockToggleCommand';
import { MockCheckableCommand } from './MockCheckableCommand';
import { MockEnumOptionCommand } from './MockEnumOptionCommand';
import { MockSliderCommand } from './MockSliderCommand';
import { MockFilterCommand } from './MockFilterCommand';
import { MockNumberOptionCommand } from './MockNumberOptionCommand';
import { MockSectionCommand } from './MockSectionCommand';
import { DividerCommand } from '../DividerCommand';

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

  public override get tooltip(): TranslateKey {
    return { fallback: 'Mock Settings' };
  }

  public override get icon(): IconName {
    return 'Bug';
  }
}
