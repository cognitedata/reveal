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

  private _onFinish?: () => void;

  constructor(poi: PointOfInterest<unknown>) {
    super();

    this._poi = poi;
  }

  public override get hasData(): true {
    return true;
  }

  public get onFinish(): (() => void) | undefined {
    return this._onFinish;
  }

  public set onFinish(onFinish: () => void) {
    this._onFinish = onFinish;
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

  public override get isPostButtonEnabled(): boolean {
    return this._content.length > 0;
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
