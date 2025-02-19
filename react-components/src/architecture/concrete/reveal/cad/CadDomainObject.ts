/*!
 * Copyright 2025 Cognite AS
 */

import { type CogniteCadModel } from '@cognite/reveal';
import { CadRenderStyle } from './CadRenderStyle';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { type IconName } from '../../../base/utilities/IconName';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { getRenderTarget } from '../../../base/domainObjects/getRoot';

export class CadDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: CogniteCadModel;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): CogniteCadModel | undefined {
    return this._model;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: CogniteCadModel) {
    super();
    this._model = model;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'CAD' };
  }

  public override get icon(): IconName {
    return 'Cubes';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new CadRenderStyle();
  }

  protected override removeCore(): void {
    super.removeCore();
    getRenderTarget(this)?.viewer?.removeModel(this._model);
  }
}
