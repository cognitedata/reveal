/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';

import { Box3, Plane, Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { Button, Dropdown, Menu, RangeSlider } from '@cognite/cogs.js';

import styled from 'styled-components';

export const SlicerButton = (): ReactElement => {
  const viewer = useReveal();

  const [{ minHeight, maxHeight, topRatio, bottomRatio }, setSliceState] = useState<{
    minHeight: number;
    maxHeight: number;
    topRatio: number;
    bottomRatio: number;
  }>({
    minHeight: 0,
    maxHeight: 0,
    topRatio: 1,
    bottomRatio: 0
  });

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
      const newTopRatio = getRatioForNewRange(topRatio, minHeight, maxHeight, newMinY, newMaxY);
      const newBottomRatio = getRatioForNewRange(
        bottomRatio,
        minHeight,
        maxHeight,
        newMinY,
        newMaxY
      );

      setSliceState({
        maxHeight: newMaxY,
        minHeight: newMinY,
        topRatio: newTopRatio,
        bottomRatio: newBottomRatio
      });
    }
  }, [viewer, viewer.models.length, lastModel]);

  return (
    <Dropdown
      appendTo={() => document.body}
      content={
        <StyledMenu>
          <RangeSlider
            min={0}
            max={1}
            step={0.01}
            setValue={(v: number[]) => {
              viewer.setGlobalClippingPlanes([
                new Plane(new Vector3(0, 1, 0), -(minHeight + v[0] * (maxHeight - minHeight))),
                new Plane(new Vector3(0, -1, 0), minHeight + v[1] * (maxHeight - minHeight))
              ]);

              setSliceState({
                maxHeight,
                minHeight,
                bottomRatio: v[0],
                topRatio: v[1]
              });
            }}
            marks={{}}
            value={[bottomRatio, topRatio]}
            vertical
          />
        </StyledMenu>
      }
      placement="right-end">
      <Button type="ghost" icon="Slice" aria-label="Slice models" />
    </Dropdown>
  );
};

function getRatioForNewRange(
  ratio: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
): number {
  if (ratio === 0 || ratio === 1) {
    return ratio;
  }

  const position = oldMin + ratio * (oldMax - oldMin);
  const newRatio = (position - newMin) / (newMax - newMin);

  return Math.min(1.0, Math.max(0.0, newRatio));
}

const StyledMenu = styled(Menu)`
  height: 512px;
  padding: 12px;
  min-width: 0px;
`;
