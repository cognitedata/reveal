/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslateKey } from '../../utilities/TranslateKey';
import { SectionCommand } from '../SectionCommand';

export class MockSectionCommand extends SectionCommand {
  public override get tooltip(): TranslateKey {
    return { fallback: 'Slider section' };
  }
}
