/*!
 * Copyright 2022 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import {
  Cognite3DViewerOptions,
  PotreePointColorType,
  AnnotationListStylableObjectCollection,
  CognitePointCloudModel
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

import { Mock } from 'moq.ts';

function ColorStylingCognite3DViewerPointCloudTestPage() {
  const modelUrl = 'pointcloud-bunny';
  const sdkMock = new Mock<CogniteClient>()
    .setup(p => p.annotations)
    .returns(new Mock<CogniteClient['annotations']>()
      .setup(a => a.list)
      .returns(() => {
        const promise = Promise.resolve({ items: [{ id: 123, data: { region: [
          { cylinder: { centerA: [-0.03, 0.1, -1000], centerB: [-0.03, 0.1, 1000], radius: 0.04 } }
        ] } } ] } );

        Object.assign(promise, { autoPagingToArray: async (_arg: { limit: number }) => (await promise).items });
        return promise as any;
      }).object()
    );

  const viewerOptions: Partial<Cognite3DViewerOptions> = {
    sdk: sdkMock.object()
  };

  return <Cognite3DTestViewer modelUrls={[modelUrl]} pointCloudModelAddedCallback={(model: CognitePointCloudModel) => {
    model.pointColorType = PotreePointColorType.Height;

    const stylableObjectIds: number[] = [];
    model.traverseStylableObjects(m => stylableObjectIds.push(m.annotationId));

    const objectCollection = new AnnotationListStylableObjectCollection(stylableObjectIds);
    const appearance = { color: [0, 255, 0] as [number, number, number] };

    model.assignStyledObjectCollection(objectCollection, appearance);
    model.setDefaultPointCloudAppearance({ visible: false });
  }}
  viewerOptions={viewerOptions} />;
}

registerVisualTest('pointcloud', 'color-styling', 'Color Styling', <ColorStylingCognite3DViewerPointCloudTestPage />)
