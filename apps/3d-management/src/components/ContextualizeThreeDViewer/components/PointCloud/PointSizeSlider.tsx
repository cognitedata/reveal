import React from 'react';

import styled from 'styled-components';

import { Slider as CogsSlider, Flex, Menu } from '@cognite/cogs.js';

import {
  MAX_POINT_SIZE,
  MIN_POINT_SIZE,
  STEP_POINT_SIZE,
} from '../../../../pages/ContextualizeEditor/constants';
import {
  useContextualizeThreeDViewerStore,
  updateVisualizationOptions,
} from '../../useContextualizeThreeDViewerStore';

export const PointSizeSlider = (): React.ReactElement => {
  const { visualizationOptions } = useContextualizeThreeDViewerStore(
    (state) => ({
      visualizationOptions: state.visualizationOptions,
    })
  );

  return (
    <Menu.Item>
      <Flex direction="row" gap={8}>
        <label>Point Size</label>
        <StyledSlider
          min={MIN_POINT_SIZE}
          max={MAX_POINT_SIZE}
          step={STEP_POINT_SIZE}
          onChange={(pointSize: number) => {
            updateVisualizationOptions({ pointSize });
          }}
          value={visualizationOptions.pointSize}
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
