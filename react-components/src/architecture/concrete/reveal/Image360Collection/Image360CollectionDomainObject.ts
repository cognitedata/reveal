/*!
 * Copyright 2025 Cognite AS
 */

import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type IconName } from '../../../base/utilities/IconName';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { type Image360Model } from '../RevealTypes';
import { Image360CollectionRenderStyle } from './Image360CollectionRenderStyle';

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
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'Image360' };
  }

  public override get icon(): IconName {
    return 'View360';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new Image360CollectionRenderStyle();
  }

  protected override removeCore(): void {
    super.removeCore();
    getRenderTarget(this)?.viewer?.remove360ImageSet(this._model);
  }
}
