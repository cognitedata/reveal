/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector3 } from 'three';
import { BaseInputCommand } from '../../base/commands/BaseInputCommand';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { type TranslateDelegate } from '../../base/utilities/TranslateKey';
import { createPointsOfInterestPropertiesFromPointAndTitle } from './types';

export class CreatePointsOfInterestWithDescriptionCommand extends BaseInputCommand {
  private readonly _point: Vector3;

  constructor(position: Vector3) {
    super();

    this._point = position;
  }

  public override getPostButtonLabel(t: TranslateDelegate): string | undefined {
    return t('CREATE', 'Create');
  }

  public override getCancelButtonLabel(t: TranslateDelegate): string | undefined {
    return t('CANCEL', 'Cancel');
  }

  public override getPlaceholder(t: TranslateDelegate): string | undefined {
    return t('POI_DESCRIPTION_PLACEHOLDER', 'Write a points of interest description');
  }

  public override get hasData(): true {
    return true;
  }

  public override invokeCore(): boolean {
    if (this._content === undefined) {
      return false;
    }

    const domainObject = this.rootDomainObject.getDescendantByType(PointsOfInterestDomainObject);

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
