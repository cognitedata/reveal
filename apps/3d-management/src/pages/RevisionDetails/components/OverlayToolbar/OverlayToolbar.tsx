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
} from 'pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';

import styled from 'styled-components';

const SliderContainer = styled.div`
  display: flex;
  > div {
    margin: 32px;
  }
`;

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
      <SliderContainer>
        <Slider min={0} max={2} step={0.05} defaultValue={model.pointSize} />
      </SliderContainer>
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
