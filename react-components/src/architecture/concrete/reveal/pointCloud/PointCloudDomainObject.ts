import { signal } from '@cognite/signals';
import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { type IconName } from '../../../base/utilities/IconName';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { RevealDomainObject } from '../RevealDomainObject';
import { type PointCloud } from '../RevealTypes';
import { type PointColorType, type PointShape } from '@cognite/reveal';

export class PointCloudDomainObject extends RevealDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: PointCloud;
  public readonly pointSize = signal(0);
  public readonly pointShape = signal<PointShape>(0);
  public readonly pointColorType = signal<PointColorType>(0);

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): PointCloud {
    return this._model;
  }
  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: PointCloud) {
    super();
    this._model = model;
    this.pointSize(model.pointSize);
    this.pointShape(model.pointShape);
    this.pointColorType(model.pointColorType);

    // This updated the point cloud on reveal side when the signals change.
    this.addEffect(() => {
      this._model.pointSize = this.pointSize();
      this._model.pointShape = this.pointShape();
      this._model.pointColorType = this.pointColorType();
    });
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'PointCloud' };
  }

  public override get icon(): IconName {
    return 'PointCloud';
  }

  public override get hasIconColor(): boolean {
    return false;
  }

  protected override dispose(): void {
    super.dispose();
    const viewer = getRenderTarget(this)?.viewer;
    if (viewer?.models?.includes(this._model) ?? false) {
      viewer?.removeModel(this._model);
    }
  }
}
