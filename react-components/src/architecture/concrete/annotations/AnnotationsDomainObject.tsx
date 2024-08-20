/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type PointCloudAnnotation } from './utils/types';
import { type AnnotationsBoundingVolume } from '@cognite/sdk/dist/src';
import { AnnotationsView } from './AnnotationsView';
import { AnnotationsRenderStyle } from './AnnotationsRenderStyle';

export class AnnotationsDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotations: PointCloudAnnotation[] = [];

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotations' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new AnnotationsRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new AnnotationsView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createMock(): PointCloudAnnotation[] {
    const annotations: PointCloudAnnotation[] = [];

    const geometry: AnnotationsBoundingVolume = {
      confidence: 0.5,
      label: 'test',
      region: [
        {
          box: {
            confidence: 0.5,
            label: 'test',
            matrix: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        }
      ]
    };

    const annotation: PointCloudAnnotation = {
      source: 'asset-centric',
      id: 1,
      status: 'approved',
      geometry,
      assetRef: { source: 'asset-centric', id: 1 },
      creatingApp: '3d-management'
    };
    annotations.push(annotation);
    return annotations;
  }
}
