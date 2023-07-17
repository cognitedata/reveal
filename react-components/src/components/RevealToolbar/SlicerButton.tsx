/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useMemo } from 'react';

import { Box3, Plane, Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { Button, Dropdown, Menu, RangeSlider } from '@cognite/cogs.js';

import styled from 'styled-components';

export const SlicerButton = (): ReactElement => {
  const viewer = useReveal();

  const [minHeight, maxHeight] = useMemo(() => {
    const box = new Box3();
    viewer.models.forEach((model) => box.union(model.getModelBoundingBox()));

    return [box.min.y, box.max.y];
  }, [viewer, viewer.models.length]);

  const [currentValue, setCurrentValue] = useState<number[]>([0, 1]);

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
              if (v[0] !== undefined && v[1] !== undefined) {
                setCurrentValue(v);
                viewer.setGlobalClippingPlanes([
                  new Plane(new Vector3(0, 1, 0), -(minHeight + v[0] * (maxHeight - minHeight))),
                  new Plane(new Vector3(0, -1, 0), minHeight + v[1] * (maxHeight - minHeight))
                ]);
              }
            }}
            marks={{}}
            value={currentValue}
            vertical
          />
        </StyledMenu>
      }
      placement="right-end">
      <Button type="ghost" icon="Slice" aria-label="Slice models" />
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  height: 512px;
  padding: 12px;
  min-width: 0px;
`;
