/*!
 * Copyright 2024 Cognite AS
 */
import { BaseInputCommand } from '../../base/commands/BaseInputCommand';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type TranslateDelegate } from '../../base/utilities/TranslateKey';
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

  public override getPostButtonLabel(t: TranslateDelegate): string | undefined {
    return t('SEND', 'Send');
  }

  public override getCancelButtonLabel(t: TranslateDelegate): string | undefined {
    return t('CANCEL', 'Cancel');
  }

  public override getPlaceholder(t: TranslateDelegate): string | undefined {
    return t('COMMENT_PLACEHOLDER', 'Write a comment');
  }

  public override invokeCore(): boolean {
    if (this._content === undefined) {
      return false;
    }

    const domainObject = this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);
    domainObject?.postCommentForPoi(this._poi, this._content).then(() => {
      this._onFinish?.();
      domainObject?.notify(Changes.addedPart);
    });
    return true;
  }
}
