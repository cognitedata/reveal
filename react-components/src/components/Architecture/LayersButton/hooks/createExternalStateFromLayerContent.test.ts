import { describe, expect, test } from 'vitest';
import { createExternalStateFromLayerContent } from './createExternalStateFromLayerContent';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject
} from '../../../../architecture';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';

describe(createExternalStateFromLayerContent.name, () => {
  test('returns empty layers for empty input', () => {
    const result = createExternalStateFromLayerContent(
      { cadModels: [], pointClouds: [], image360Collections: [] },
      createRenderTargetMock()
    );

    expect(result.cadLayers).toEqual([]);
    expect(result.pointCloudLayers).toEqual([]);
    expect(result.image360Layers).toEqual([]);
  });

  test('returns right visibility and index for each model', () => {
    const CAD_REVISION_ID0 = 123;
    const CAD_REVISION_ID1 = 234;
    const POINT_CLOUD_REVISION_ID0 = 345;
    const POINT_CLOUD_REVISION_ID1 = 456;
    const IMAGE_360_SITE_ID0 = 'site-id-0';
    const IMAGE_360_SITE_ID1 = 'site-id-1';

    const cad0 = new CadDomainObject(
      createCadMock({ revisionId: CAD_REVISION_ID0, visible: true })
    );
    const cad1 = new CadDomainObject(
      createCadMock({ revisionId: CAD_REVISION_ID1, visible: false })
    );

    const pointCloud0 = new PointCloudDomainObject(
      createPointCloudMock({ revisionId: POINT_CLOUD_REVISION_ID0, visible: false })
    );
    const pointCloud1 = new PointCloudDomainObject(
      createPointCloudMock({ revisionId: POINT_CLOUD_REVISION_ID1, visible: true })
    );

    const image360Collection0 = new Image360CollectionDomainObject(
      createImage360ClassicMock({ siteId: IMAGE_360_SITE_ID0, visible: true })
    );
    const image360Collection1 = new Image360CollectionDomainObject(
      createImage360ClassicMock({ siteId: IMAGE_360_SITE_ID1, visible: false })
    );

    const renderTarget = createRenderTargetMock();

    cad0.setVisibleInteractive(true, renderTarget);
    pointCloud1.setVisibleInteractive(true, renderTarget);
    image360Collection0.setVisibleInteractive(true, renderTarget);

    const result = createExternalStateFromLayerContent(
      {
        cadModels: [cad0, cad1],
        pointClouds: [pointCloud0, pointCloud1],
        image360Collections: [image360Collection0, image360Collection1]
      },
      renderTarget
    );

    expect(result.cadLayers).toEqual([
      {
        revisionId: CAD_REVISION_ID0,
        applied: true,
        index: 0
      },
      { revisionId: CAD_REVISION_ID1, applied: false, index: 1 }
    ]);

    expect(result.pointCloudLayers).toEqual([
      { revisionId: POINT_CLOUD_REVISION_ID0, applied: false, index: 0 },
      { revisionId: POINT_CLOUD_REVISION_ID1, applied: true, index: 1 }
    ]);

    expect(result.image360Layers).toEqual([
      { siteId: IMAGE_360_SITE_ID0, applied: true, index: 0 },
      { siteId: IMAGE_360_SITE_ID1, applied: false, index: 1 }
    ]);
  });
});
