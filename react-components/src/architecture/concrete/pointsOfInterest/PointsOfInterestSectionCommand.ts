/*!
 * Copyright 2024 Cognite AS
 */

import { SectionCommand } from '../../base/commands/SectionCommand';
import { type TranslationInput } from '../../base/utilities/TranslateInput';

export class PointsOfInterestSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_OF_INTEREST_PLURAL' };
  }
}
