import { Button, Dropdown, Menu, RangeSlider, Tooltip } from '@cognite/cogs.js';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  THREE,
} from '@cognite/reveal';
import { ids } from 'cogs-variables';
import { useMemo, useState } from 'react';

import styled from 'styled-components';

type SliderProps = {
  viewer: Cognite3DViewer;
  viewerModel?: Cognite3DModel | CognitePointCloudModel;
};

export const Slicer = ({ viewer, viewerModel }: SliderProps): JSX.Element => {
  const [min, max] = useMemo(() => {
    const bounds = viewerModel?.getModelBoundingBox();
    return [bounds?.min.y ?? 0, bounds?.max.y ?? 0];
  }, [viewerModel]);

  const [sliderValue, setSliderValue] = useState<[number, number]>([min, max]);

  if (!viewerModel || min === undefined || max === undefined) {
    return <></>;
  }

  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <StyledSlider
            min={min}
            max={max}
            step={(max - min) / 1000}
            setValue={v => {
              if (v[0] !== undefined && v[1] !== undefined) {
                const maxVector = [0, -1, 0];
                const minVector = [0, 1, 0];
                viewer.setClippingPlanes([
                  new THREE.Plane(new THREE.Vector3(...minVector), -v[0]),
                  new THREE.Plane(new THREE.Vector3(...maxVector), v[1]),
                ]);
                setSliderValue([v[0], v[1]]);
              }
            }}
            value={sliderValue}
            vertical
          />
        </StyledMenu>
      }
      placement="right-end"
    >
      <Tooltip content="Slice">
        <Button icon="Slice" type="ghost" />
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
