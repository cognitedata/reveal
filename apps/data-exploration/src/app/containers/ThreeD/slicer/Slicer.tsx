import { Button, Dropdown, Menu, RangeSlider, Tooltip } from '@cognite/cogs.js';
import * as THREE from 'three';
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
} from '@cognite/reveal';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { ids } from '../../../../cogs-variables';
import { useContext, useEffect, useMemo } from 'react';

import styled from 'styled-components';

type SliderProps = {
  viewer: Cognite3DViewer;
  viewerModel?: CogniteCadModel | CognitePointCloudModel;
};

export const Slicer = ({ viewer, viewerModel }: SliderProps): JSX.Element => {
  const { setSlicingState, slicingState } = useContext(ThreeDContext);

  const [min, max] = useMemo(() => {
    const bounds = viewerModel?.getModelBoundingBox();
    const values = [bounds?.min.y ?? 0, bounds?.max.y ?? 0];

    return values;
  }, [viewerModel]);

  useEffect(() => {
    if (!slicingState) return;

    const maxVector = [0, -1, 0];
    const minVector = [0, 1, 0];

    viewer.setClippingPlanes([
      new THREE.Plane(new THREE.Vector3(...minVector), -slicingState.bottom),
      new THREE.Plane(new THREE.Vector3(...maxVector), slicingState.top),
    ]);
  }, [slicingState, viewer]);

  if (!viewerModel || min === undefined || max === undefined) {
    return <></>;
  }

  const sliderValue = [slicingState?.bottom ?? min, slicingState?.top ?? max];

  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <StyledSlider
            min={min}
            max={max}
            step={(max - min) / 1000}
            setValue={(v) => {
              if (v[0] !== undefined && v[1] !== undefined) {
                setSlicingState({ top: v[1], bottom: v[0] });
              }
            }}
            value={sliderValue}
            vertical
          />
        </StyledMenu>
      }
      placement="right-end"
    >
      <Tooltip content="Slice" placement="right">
        <Button
          icon="Slice"
          type="ghost"
          aria-label="slice-button"
          onClick={() => {
            trackUsage(EXPLORATION.CLICK.SLICE);
          }}
        />
      </Tooltip>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  height: 512px;
  padding: 12px;

  .rc-slider-vertical .rc-slider-mark {
    display: none;
  }
`;

const StyledSlider = styled(RangeSlider)`
  offset-anchor: right top;
  float: right;
  display: inline;
`;
