/*!
 * Copyright 2024 Cognite AS
 */

import { type CogniteCadModel } from '@cognite/reveal';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type ThreeView } from '../../base/views/ThreeView';
import { CadRenderStyle } from './CadRenderStyle';
import { CadThreeView } from './CadThreeView';

export class CadDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  readonly modelId: number;
  readonly revisionId: number;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): CogniteCadModel | undefined {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return undefined;
    }
    for (const model of root.renderTarget.getCadModels()) {
      if (model.modelId === this.modelId && model.revisionId === this.revisionId) {
        return model;
      }
    }
    return undefined;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(modelId: number, revisionId: number) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
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
