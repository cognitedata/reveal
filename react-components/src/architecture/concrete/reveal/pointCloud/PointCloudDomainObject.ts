import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type IconName } from '../../../base/utilities/IconName';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { RevealDomainObject } from '../RevealDomainObject';
import { type PointCloud } from '../RevealTypes';
import { PointCloudRenderStyle } from './PointCloudRenderStyle';

export class PointCloudDomainObject extends RevealDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _model: PointCloud;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): PointCloud | undefined {
    return this._model;
  }
  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: PointCloud) {
    super();
    this._model = model;
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

  public override createRenderStyle(): RenderStyle | undefined {
    return new PointCloudRenderStyle();
  }

  protected override removeCore(): void {
    super.removeCore();
    const viewer = getRenderTarget(this)?.viewer;
    if (viewer?.models.includes(this._model) ?? false) {
      viewer?.removeModel(this._model);
    }
  }
}
