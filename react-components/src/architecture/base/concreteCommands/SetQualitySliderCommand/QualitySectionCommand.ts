/*!
 * Copyright 2024 Cognite AS
 */

import { SectionCommand } from '../../commands/SectionCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';

export class QualitySectionCommand extends SectionCommand {
  public override get tooltip(): TranslationInput {
    return { untranslated: 'Rendering detail level (1: low, 5: high)' };
  }
}
