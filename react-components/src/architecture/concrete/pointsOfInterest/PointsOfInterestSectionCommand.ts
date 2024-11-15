/*!
 * Copyright 2024 Cognite AS
 */

import { SectionCommand } from '../../base/commands/SectionCommand';
import { TranslateKey } from '../../base/utilities/TranslateKey';

export class PointsOfInterestSectionCommand extends SectionCommand {
  public override get isVisible(): boolean {
    return this.renderTarget.get360ImageCollections().next().value !== undefined;
  }

  public override get tooltip(): TranslateKey {
    return { key: 'POINTS_OF_INTEREST', fallback: 'Points of Interest' };
  }
}
