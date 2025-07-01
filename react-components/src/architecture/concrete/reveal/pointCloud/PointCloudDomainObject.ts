import { getRenderTarget } from '../../../base/domainObjects/getRoot';
import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
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

  readonly _model: PointCloud;

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
    getRenderTarget(this)?.viewer?.removeModel(this._model);
  }
}
