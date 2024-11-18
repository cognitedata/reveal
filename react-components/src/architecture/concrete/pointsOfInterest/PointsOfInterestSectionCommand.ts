/*!
 * Copyright 2024 Cognite AS
 */

import { SectionCommand } from '../../base/commands/SectionCommand';
import { type TranslateKey } from '../../base/utilities/TranslateKey';

export class PointsOfInterestSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_OF_INTEREST_PLURAL', fallback: 'Points of Interest' };
  }
}
