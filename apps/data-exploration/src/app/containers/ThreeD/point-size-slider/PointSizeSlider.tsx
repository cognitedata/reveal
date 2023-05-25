import {
  Button,
  Colors,
  Detail,
  Dropdown,
  Flex,
  Menu,
  Slider as CogsSlider,
  Tooltip,
} from '@cognite/cogs.js';
import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';
import { useContext, useEffect, useState } from 'react';

import styled from 'styled-components';
import { ids } from '../../../../cogs-variables';
import { ThreeDContext } from '../ThreeDContext';
import { updateAllPointCloudsPointSize } from '../utils';

type SliderProps = {
  pointCloudModel?: CognitePointCloudModel;
  viewer?: Cognite3DViewer;
};

const DEFAULT_POINT_SIZE = 2;

export default function PointSizeSlider({
  pointCloudModel,
  viewer,
}: SliderProps) {
  const { secondaryModels } = useContext(ThreeDContext);
  const [sliderValue, setSliderValue] = useState(DEFAULT_POINT_SIZE);
  const [isSecondaryPointCloudLoaded, setIsSecondaryPointCloudLoaded] =
    useState(false);

  useEffect(() => {
    const appliedModels = secondaryModels.filter((model) => model.applied);

    Promise.all(
      appliedModels.map((model) =>
        viewer?.determineModelType(model.modelId, model.revisionId)
      )
    ).then((modelTypes) => {
      setIsSecondaryPointCloudLoaded(
        modelTypes.some((modelType) => modelType === 'pointcloud')
      );
    });
  }, [secondaryModels, isSecondaryPointCloudLoaded, viewer]);

  if (!(isSecondaryPointCloudLoaded || pointCloudModel) || !viewer) {
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
                onChange={(pointSizeValue) => {
                  updateAllPointCloudsPointSize(viewer, pointSizeValue);
                  setSliderValue(pointSizeValue);
                }}
                value={sliderValue}
              />
            </Flex>
          </Flex>
        </StyledMenu>
      }
    >
      <Tooltip content="Point size" placement="right">
        <FullWidthButton
          icon="DotLarge"
          type="ghost"
          aria-label="point-size-button"
        />
      </Tooltip>
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

const FullWidthButton = styled(Button)`
  width: 100%;
`;
