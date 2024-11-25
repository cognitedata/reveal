/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector3 } from 'three';
import { BaseInputCommand } from '../../base/commands/BaseInputCommand';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { createPointsOfInterestPropertiesFromPointAndTitle } from './types';

export class CreatePointsOfInterestWithDescriptionCommand extends BaseInputCommand {
  private readonly _point: Vector3;

  constructor(position: Vector3) {
    super();

    this._point = position;
  }

  public override getPostButtonLabel(): TranslationInput {
    return { key: 'CREATE' };
  }

  public override getCancelButtonLabel(): TranslationInput {
    return { key: 'CANCEL' };
  }

  public override getPlaceholder(): TranslationInput {
    return { key: 'POINT_OF_INTEREST_DESCRIPTION_PLACEHOLDER' };
  }

  public override get hasData(): true {
    return true;
  }

  public override invokeCore(): boolean {
    if (this._content === undefined) {
      return false;
    }

    const domainObject = this.renderTarget.rootDomainObject.getDescendantByType(
      PointsOfInterestDomainObject
    );

    if (domainObject === undefined) {
      return false;
    }

    const poi = domainObject.addPendingPointsOfInterest(
      createPointsOfInterestPropertiesFromPointAndTitle(this._point, this._content)
    );

    void domainObject.save().then(() => {
      this.onFinish?.();
      domainObject.setSelectedPointOfInterest(poi);
    });

    return true;
  }
}
