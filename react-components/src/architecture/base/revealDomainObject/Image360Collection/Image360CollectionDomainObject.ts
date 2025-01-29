/*!
 * Copyright 2025 Cognite AS
 */

import { VisualDomainObject } from '../../domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../renderStyles/RenderStyle';
import { type IconName } from '../../utilities/IconName';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { type ThreeView } from '../../views/ThreeView';
import { type Image360Model } from '../RevealTypes';
import { Image360CollectionRenderStyle } from './Image360CollectionRenderStyle';
import { Image360CollectionThreeView } from './Image360CollectionThreeView';

export class Image360CollectionDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  readonly _model: Image360Model;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): Image360Model | undefined {
    return this._model;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: Image360Model) {
    super();
    this._model = model;
    console.log('Image360CollectionDomainObject constructor');
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'Cad' };
  }

  public override get icon(): IconName {
    return 'Cubes';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new Image360CollectionRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new Image360CollectionThreeView();
  }
}
