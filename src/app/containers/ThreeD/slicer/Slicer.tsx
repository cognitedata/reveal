import {
  Button,
  Colors,
  Detail,
  Dropdown,
  Flex,
  Menu,
  Slider as CogsSlider,
} from '@cognite/cogs.js';
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
  viewerModel: Cognite3DModel | CognitePointCloudModel;
};

export const Slicer = ({ viewer, viewerModel }: SliderProps): JSX.Element => {
  const [min, max] = useMemo(() => {
    const bounds = viewerModel?.getModelBoundingBox();
    return [bounds?.min.y, bounds?.max.y];
  }, [viewerModel]);

  const [sliderValue, setSliderValue] = useState(max);

  if (!viewer || !viewerModel || min === undefined || max === undefined) {
    return <></>;
  }

  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <Flex direction="column" gap={12}>
            <Flex direction="column" gap={2}>
              <StyledHeader strong>Slicing</StyledHeader>
              <StyledSlider
                min={min}
                max={max}
                step={(max - min) / 250.0}
                onChange={v => {
                  const vector = [0, -1, 0];
                  viewer.setClippingPlanes([
                    new THREE.Plane(new THREE.Vector3(...vector), v),
                  ]);
                  setSliderValue(v);
                }}
                value={sliderValue}
              />
            </Flex>
          </Flex>
        </StyledMenu>
      }
    >
      <Button icon="Slice" />
    </Dropdown>
  );
};

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
