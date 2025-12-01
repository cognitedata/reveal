import { signal } from '@cognite/signals';
import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { type IconName } from '../../../base/utilities/types';
import { type TranslationInput } from '../../../base/utilities/translation/TranslateInput';
import { RevealDomainObject } from '../RevealDomainObject';
import { type Image360Model } from '../RevealTypes';
import { type Box3, Vector3 } from 'three';

export class Image360CollectionDomainObject extends RevealDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: Image360Model;
  public readonly isIconsVisible = signal(false);
  public readonly isOccludedIconsVisible = signal(false);
  public readonly iconsOpacity = signal(0);
  public readonly imagesOpacity = signal(0);
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

    this.isIconsVisible(model.getIconsVisibility());
    this.isOccludedIconsVisible(model.isOccludedIconsVisible());
    this.iconsOpacity(model.getIconsOpacity());
    this.imagesOpacity(model.getImagesOpacity());

    // This updated the point cloud on reveal side when the signals change.
    this.addEffect(() => {
      this._model.setIconsVisibility(this.isIconsVisible());
      this._model.setOccludedIconsVisible(this.isOccludedIconsVisible());
      this._model.setIconsOpacity(this.iconsOpacity());
      this._model.setImagesOpacity(this.imagesOpacity());
    });

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

  public override expandBoundingBox(boundingBox: Box3): void {
    const model = this.model;
    const position = new Vector3();
    for (const entity of model.image360Entities) {
      position.setFromMatrixPosition(entity.transform);
      boundingBox.expandByPoint(position);
    }
  }

  public override dispose(): void {
    super.dispose();
    getRenderTarget(this)?.viewer?.remove360ImageSet(this._model);

    this._model.off('image360Entered', this._updateCallback);
    this._model.off('image360Exited', this._updateCallback);
  }
}
