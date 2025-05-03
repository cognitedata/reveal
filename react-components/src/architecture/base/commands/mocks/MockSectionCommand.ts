/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslationInput } from '../../utilities/TranslateInput';
import { SectionCommand } from '../SectionCommand';

export class MockSectionCommand extends SectionCommand {
  public override get tooltip(): TranslationInput {
    return { untranslated: 'Slider section' };
  }
}
