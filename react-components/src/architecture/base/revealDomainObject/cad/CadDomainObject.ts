/*!
 * Copyright 2025 Cognite AS
 */

import { VisualDomainObject } from '../../domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../renderStyles/RenderStyle';
import { type IconName } from '../../utilities/IconName';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { type ThreeView } from '../../views/ThreeView';
import { type CadModel } from '../RevealTypes';
import { CadRenderStyle } from './CadRenderStyle';
import { CadThreeView } from './CadThreeView';

export class CadDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: CadModel;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): CadModel | undefined {
    return this._model;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: CadModel) {
    super();
    this._model = model;
    console.log('CadDomainObject constructor');
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
    return new CadRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new CadThreeView();
  }
}
