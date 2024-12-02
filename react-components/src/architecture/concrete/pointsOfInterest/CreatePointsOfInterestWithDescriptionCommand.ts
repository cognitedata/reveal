/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector3 } from 'three';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { createPointsOfInterestPropertiesFromPointAndTitle } from './types';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import {
  CustomBaseInputCommand,
  type FieldContent
} from '../../base/commands/CustomBaseInputCommand';

export class CreatePointsOfInterestWithDescriptionCommand extends CustomBaseInputCommand {
  private readonly _point: Vector3;
  private readonly _scene: DmsUniqueIdentifier;

  private readonly poisPlaceholders: TranslationInput[] = [
    { key: 'NAME' },
    { key: 'POINT_OF_INTEREST_DESCRIPTION_PLACEHOLDER' }
  ];

  private readonly poiContents: FieldContent[] = [
    { type: 'text', content: '' },
    { type: 'commentWithButtons', content: '' }
  ];

  constructor(position: Vector3, scene: DmsUniqueIdentifier) {
    super();

    this._point = position;
    this._scene = scene;
    this._placeholders = this.poisPlaceholders;
    this._contents = this.poiContents;
  }

  public override getPostButtonLabel(): TranslationInput {
    return { key: 'CREATE' };
  }

  public override getCancelButtonLabel(): TranslationInput {
    return { key: 'CANCEL' };
  }

  public override getPlaceholderByIndex(index: number): TranslationInput | undefined {
    return this._placeholders?.[index] ?? undefined;
  }

  public override getAllPlaceholders(): TranslationInput[] {
    return this._placeholders ?? [];
  }

  public override get hasData(): true {
    return true;
  }

  public override invokeCore(): boolean {
    if (this._contents === undefined) {
      return false;
    }

    const domainObject = this.renderTarget.rootDomainObject.getDescendantByType(
      PointsOfInterestDomainObject
    );

    if (domainObject === undefined) {
      return false;
    }

    const poi = domainObject.addPendingPointsOfInterest(
      createPointsOfInterestPropertiesFromPointAndTitle(
        this._point,
        this._scene,
        this._contents.map((content) => content.content)
      )
    );

    void domainObject.save().then(() => {
      this.onFinish?.();
      domainObject.setSelectedPointOfInterest(poi);
    });

    return true;
  }
}
