import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Slider as CogsSlider, Flex, Menu } from '@cognite/cogs.js';
import { Cognite3DViewer, CognitePointCloudModel } from '@cognite/reveal';

import {
  MAX_POINT_SIZE,
  MIN_POINT_SIZE,
  STEP_POINT_SIZE,
  DEFAULT_POINT_SIZE,
} from '../../../pages/ContextualizeEditor/constants';

function getDefaultPointSize(viewer: Cognite3DViewer) {
  for (const model of viewer.models)
    if (model instanceof CognitePointCloudModel) return model.pointSize;
  return DEFAULT_POINT_SIZE;
}

function updateAllPointCloudsPointSize(
  viewer: Cognite3DViewer,
  pointSize: number
) {
  for (const model of viewer.models)
    if (model instanceof CognitePointCloudModel) model.pointSize = pointSize;
}

type Props = {
  viewer: Cognite3DViewer;
};

export const PointSizeSlider = ({ viewer }: Props): React.ReactElement => {
  const [sliderValue, setSliderValue] = useState(getDefaultPointSize(viewer));

  useEffect(() => {
    updateAllPointCloudsPointSize(viewer, sliderValue);
  }, [viewer, sliderValue]);

  return (
    <Menu.Item>
      <Flex direction="row" gap={8}>
        <label>Point Size</label>
        <StyledSlider
          min={MIN_POINT_SIZE}
          max={MAX_POINT_SIZE}
          step={STEP_POINT_SIZE}
          onChange={setSliderValue}
          value={sliderValue}
        />
      </Flex>
    </Menu.Item>
  );
};

const StyledSlider = styled(CogsSlider)`
  offset-anchor: right top;
  float: right;
  display: inline;
  width: 120px;
`;
