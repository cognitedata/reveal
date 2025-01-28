/*!
 * Copyright 2024 Cognite AS
 */

import { type CognitePointCloudModel, type DataSourceType } from '@cognite/reveal';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type IconName } from '../../base/utilities/IconName';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { type ThreeView } from '../../base/views/ThreeView';
import { PointCloudRenderStyle } from './PointCloudRenderStyle';
import { PointCloudThreeView } from './PointCloudThreeView';

type PointCloud = CognitePointCloudModel<DataSourceType>;

export class PointCloudDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get pointCloud(): PointCloud | undefined {
    const root = this.rootDomainObject;
    if (root === undefined) {
      return undefined;
    }
    for (const pointCloud of root.renderTarget.getPointClouds()) {
      if (pointCloud !== undefined) {
        return pointCloud;
      }
    }
    return undefined;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor() {
    super();
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
