/*!
 * Copyright 2025 Cognite AS
 */

import { VisualDomainObject } from '../../domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../renderStyles/RenderStyle';
import { type IconName } from '../../utilities/IconName';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { type ThreeView } from '../../views/ThreeView';
import { PointCloudRenderStyle } from './PointCloudRenderStyle';
import { PointCloudThreeView } from './PointCloudThreeView';
import { type PointCloud } from '../RevealTypes';

export class PointCloudDomainObject extends VisualDomainObject {
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

  public override createRenderStyle(): RenderStyle | undefined {
    return new PointCloudRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new PointCloudThreeView();
  }
}
