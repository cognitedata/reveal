/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';

import { Box3, Plane, Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { Button, Dropdown, Menu, RangeSlider, Tooltip as CogsTooltip } from '@cognite/cogs.js';

import styled from 'styled-components';
import { useUrlStateParam } from '../../hooks/useUrlStateParam';
import { useRevealResources } from '../RevealContainer/RevealResourcesContext';

type SliceState = {
  minHeight: number;
  maxHeight: number;
  topRatio: number;
  bottomRatio: number;
};

type SlicerButtonProps = {
  storeStateInUrl: boolean;
};

export const SlicerButton = ({ storeStateInUrl }: SlicerButtonProps): ReactElement => {
  const viewer = useReveal();
  const { reveal3DResources } = useRevealResources();
  const urlParam = useUrlStateParam();
  const { top, bottom } = storeStateInUrl
    ? urlParam.getSlicerStateFromUrlParam()
    : { top: 1, bottom: 0 };
  const [sliceActive, setSliceActive] = useState<boolean>(false);

  const [sliceState, setSliceState] = useState<SliceState>({
    minHeight: 0,
    maxHeight: 0,
    topRatio: top,
    bottomRatio: bottom
  });

  const { minHeight, maxHeight, topRatio, bottomRatio } = sliceState;

  useEffect(() => {
    const updateSliceState = (): void => {
      if (reveal3DResources.length === 0 || viewer === undefined) {
        return;
      }

      const box = new Box3();
      reveal3DResources.forEach((model) => box.union(model.getModelBoundingBox()));

      const newMaxY = box.max.y;
      const newMinY = box.min.y;

      if (maxHeight !== newMaxY || minHeight !== newMinY) {
        if (storeStateInUrl) {
          viewer.setGlobalClippingPlanes([
            new Plane(new Vector3(0, 1, 0), -(newMinY + topRatio * (newMaxY - newMinY))),
            new Plane(new Vector3(0, -1, 0), newMinY + bottomRatio * (newMaxY - newMinY))
          ]);
        }
        setSliceState({
          maxHeight: newMaxY,
          minHeight: newMinY,
          topRatio,
          bottomRatio
        });
      }
    };
    updateSliceState();
  }, [reveal3DResources]);

  function changeSlicingState(newValues: number[]): void {
    viewer.setGlobalClippingPlanes([
      new Plane(new Vector3(0, 1, 0), -(minHeight + newValues[0] * (maxHeight - minHeight))),
      new Plane(new Vector3(0, -1, 0), minHeight + newValues[1] * (maxHeight - minHeight))
    ]);

    setSliceState({
      maxHeight,
      minHeight,
      bottomRatio: newValues[0],
      topRatio: newValues[1]
    });

    if (storeStateInUrl) {
      urlParam.setUrlParamOnSlicerChanged(newValues);
    }
  }

  return (
    <CogsTooltip content={'Slice'} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={() => document.body}
        onClickOutside={() => {
          setSliceActive(false);
        }}
        content={
          <StyledMenu>
            <RangeSlider
              min={0}
              max={1}
              step={0.01}
              setValue={changeSlicingState}
              marks={{}}
              value={[bottomRatio, topRatio]}
              vertical
            />
          </StyledMenu>
        }
        placement="right-end">
        <Button
          type="ghost"
          icon="Slice"
          aria-label="Slice models"
          toggled={sliceActive}
          onClick={() => {
            setSliceActive((prevState) => !prevState);
          }}
        />
      </Dropdown>
    </CogsTooltip>
  );
};

SlicerButton.defaultProps = {
  storeStateInUrl: true
};

const StyledMenu = styled(Menu)`
  height: 512px;
  padding: 12px;
  min-width: 0px;
`;
