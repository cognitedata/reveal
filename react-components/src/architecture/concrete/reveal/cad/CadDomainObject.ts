import { type CogniteCadModel } from '@cognite/reveal';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { type IconName } from '../../../base/utilities/types';
import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { RevealDomainObject } from '../RevealDomainObject';

export class CadDomainObject extends RevealDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: CogniteCadModel;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): CogniteCadModel {
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

  public override get hasIconColor(): boolean {
    return false;
  }

  public override dispose(): void {
    super.dispose();
    const viewer = getRenderTarget(this)?.viewer;
    if (viewer?.models?.includes(this._model) ?? false) {
      viewer?.removeModel(this._model);
    }
  }
}
