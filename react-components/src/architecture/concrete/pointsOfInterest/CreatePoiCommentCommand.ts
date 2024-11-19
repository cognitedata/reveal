/*!
 * Copyright 2024 Cognite AS
 */
import { BaseInputCommand } from '../../base/commands/BaseInputCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { type PointOfInterest } from './types';

export class CreatePoiCommentCommand extends BaseInputCommand {
  private readonly _poi: PointOfInterest<unknown>;

  constructor(poi: PointOfInterest<unknown>) {
    super();

    this._poi = poi;
  }

  public override get hasData(): true {
    return true;
  }

  public override getPostButtonLabel(): TranslationInput {
    return { key: 'SEND' };
  }

  public override getCancelButtonLabel(): TranslationInput {
    return { key: 'CANCEL' };
  }

  public override getPlaceholder(): TranslationInput {
    return { key: 'COMMENT_PLACEHOLDER' };
  }

  public override invokeCore(): boolean {
    if (this._content === undefined) {
      return false;
    }

    const domainObject = this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);
    void domainObject?.postCommentForPoi(this._poi, this._content).then(() => {
      this._onFinish?.();
      domainObject?.notify(Changes.addedPart);
    });
    return true;
  }
}
