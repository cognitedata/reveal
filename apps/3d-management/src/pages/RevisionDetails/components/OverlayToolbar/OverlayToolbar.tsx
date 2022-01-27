import React from 'react';
import { ToolBarButton, ToolBar, Slider } from '@cognite/cogs.js';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
} from '@cognite/reveal';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'src/pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';

type Props = {
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
};
export function OverlayToolbar({ viewer, model }: Props) {
  const buttonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Scan',
        description: 'Fit camera to the model',
        onClick: () => viewer.fitCameraToModel(model as any, 400),
      },
    ],
  ];

  if (model instanceof CognitePointCloudModel) {
    const pointSizeSlider = (
      <Slider min={0} max={5} defaultValue={model.pointSize} />
    );
    const pointSizeTool: ToolBarButton = {
      icon: 'Scan',
      description: 'Point size',
      dropdownContent: pointSizeSlider,
    };
    buttonGroups[0].push(pointSizeTool);
  }
  return <ToolBar direction="horizontal" buttonGroups={buttonGroups} />;
}
