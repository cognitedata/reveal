import {
  Button,
  Colors,
  Detail,
  Dropdown,
  Flex,
  Menu,
  Slider as CogsSlider,
} from '@cognite/cogs.js';
import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';
import { ids } from '../../../../cogs-variables';
import { useContext, useState } from 'react';

import styled from 'styled-components';
import { SecondaryModelOptions, ThreeDContext } from '../ThreeDContext';

type SliderProps = {
  pointCloudModel?: CognitePointCloudModel;
  secondaryModels?: SecondaryModelOptions[];
  viewer?: Cognite3DViewer;
};

export default function PointSizeSlider({ pointCloudModel, secondaryModels, viewer }: SliderProps) {
  const [sliderValue, setSliderValue] = useState(pointCloudModel?.pointSize);
  const loadedPointClouds: CognitePointCloudModel[] = pointCloudModel ? [pointCloudModel] : [];

  if (!viewer) {
    return null;
  }

  secondaryModels?.forEach((modelData) => {
    if (!modelData.applied) return;

    const model = viewer.models.find((model) => model.modelId === modelData.modelId && model.revisionId === modelData.revisionId);

    if (!(model instanceof CognitePointCloudModel)) return;

    loadedPointClouds.push(model);
  })

  if (loadedPointClouds.length === 0) {
    return null;
  }


  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <Flex direction="column" gap={12}>
            <Flex direction="column" gap={2}>
              <StyledHeader strong>Point size</StyledHeader>
              <StyledSlider
                min={0.01}
                max={5}
                step={0.1}
                onChange={(v) => {
                  loadedPointClouds.forEach(model => model.pointSize = v);
                  setSliderValue(v);
                }}
                value={sliderValue}
              />
            </Flex>
          </Flex>
        </StyledMenu>
      }
    >
      <Button icon="DotLarge" type="ghost" aria-label="point-size-button" />
    </Dropdown>
  );
}

const StyledMenu = styled(Menu)`
  min-width: 166px;
  padding: 12px;
`;

const StyledHeader = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

const StyledSlider = styled(CogsSlider)`
  offset-anchor: right top;
  float: right;
  display: inline;
`;
