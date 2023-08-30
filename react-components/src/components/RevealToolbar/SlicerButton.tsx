/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useRef } from 'react';

import { Box3, Plane, Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { Button, Dropdown, Menu, RangeSlider, Tooltip as CogsTooltip } from '@cognite/cogs.js';

import styled from 'styled-components';
import { useOutsideClick } from '../../hooks/useOutsideClick';

type SliceState = {
  minHeight: number;
  maxHeight: number;
  topRatio: number;
  bottomRatio: number;
};

export const SlicerButton = (): ReactElement => {
  const viewer = useReveal();
  const [sliceActive, setSliceActive] = useState<boolean>(false);
  const handleClickOutside = (): void => {
    setSliceActive(false);
  };
  const ref = useRef<HTMLButtonElement | null>(null);
  useOutsideClick(ref, handleClickOutside);

  const [sliceState, setSliceState] = useState<SliceState>({
    minHeight: 0,
    maxHeight: 0,
    topRatio: 1,
    bottomRatio: 0
  });

  const { minHeight, maxHeight, topRatio, bottomRatio } = sliceState;

  // Heuristic to increase chance that update is propagated even
  // if multiple additions/deletions of models occur.
  const lastModel =
    viewer.models.length === 0 ? undefined : viewer.models[viewer.models.length - 1];

  useEffect(() => {
    const box = new Box3();
    viewer.models.forEach((model) => box.union(model.getModelBoundingBox()));

    const newMaxY = box.max.y;
    const newMinY = box.min.y;

    if (maxHeight !== newMaxY || minHeight !== newMinY) {
      setSliceState(getNewSliceState(sliceState, newMinY, newMaxY));
    }
  }, [viewer, viewer.models.length, lastModel]);

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
  }

  return (
    <CogsTooltip content={'Slice'} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={() => document.body}
        content={
          <StyledMenu
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
            }}>
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
          ref={ref}
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

function getNewSliceState(oldSliceState: SliceState, newMin: number, newMax: number): SliceState {
  function getRatioForNewRange(ratio: number): number {
    if (ratio === 0 || ratio === 1) {
      return ratio;
    }

    const oldMin = oldSliceState.minHeight;
    const oldMax = oldSliceState.maxHeight;

    const position = oldMin + ratio * (oldMax - oldMin);
    const newRatio = (position - newMin) / (newMax - newMin);

    return Math.min(1.0, Math.max(0.0, newRatio));
  }

  return {
    maxHeight: newMax,
    minHeight: newMin,
    topRatio: getRatioForNewRange(oldSliceState.topRatio),
    bottomRatio: getRatioForNewRange(oldSliceState.bottomRatio)
  };
}

const StyledMenu = styled(Menu)`
  height: 512px;
  padding: 12px;
  min-width: 0px;
`;
