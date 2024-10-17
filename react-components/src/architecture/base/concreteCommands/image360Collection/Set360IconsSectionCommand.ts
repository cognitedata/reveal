/*!
 * Copyright 2024 Cognite AS
 */
import { SectionCommand } from '../../commands/SectionCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

export class Set360IconsSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get tooltip(): TranslateKey {
    return { fallback: '360 Markers' }; // @need-translation
  }
}
