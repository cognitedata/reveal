import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { type IconName } from '../../../base/utilities/IconName';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { RevealDomainObject } from '../RevealDomainObject';
import { type Image360Model } from '../RevealTypes';

export class Image360CollectionDomainObject extends RevealDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: Image360Model;
  private readonly _updateCallback: () => void;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): Image360Model {
    return this._model;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: Image360Model) {
    super();
    this._model = model;
    this.name = model.label;

    this._updateCallback = () => {
      getRenderTarget(this)?.updateAllCommands();
    };

    this._model.on('image360Entered', this._updateCallback);
    this._model.on('image360Exited', this._updateCallback);
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

  public override get hasIconColor(): boolean {
    return false;
  }

  public override dispose(): void {
    super.dispose();
    getRenderTarget(this)?.viewer?.remove360ImageSet(this._model);

    this._model.off('image360Entered', this._updateCallback);
    this._model.off('image360Exited', this._updateCallback);
  }
}
