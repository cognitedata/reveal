/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';

import { Box3, Plane, Vector3 } from 'three';

import { useReveal } from '../RevealCanvas/ViewerContext';
import { Button, Menu, RangeSlider, Tooltip as CogsTooltip, SliceIcon } from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';

import styled from 'styled-components';
import { useSlicerUrlParams } from './hooks/useUrlStateParam';
import { useTranslation } from '../i18n/I18n';
import { use3dModels } from '../../hooks/use3dModels';

type SliceState = {
  minHeight: number;
  maxHeight: number;
  topRatio: number;
  bottomRatio: number;
};

type SlicerButtonProps = {
  storeStateInUrl?: boolean;
};

export const SlicerButton = ({ storeStateInUrl = true }: SlicerButtonProps): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();
  const models = use3dModels();
  const [slicerUrlState, setSlicerUrlState] = useSlicerUrlParams();
  const { bottom: initialBottomRatio, top: initialTopRatio } = storeStateInUrl
    ? slicerUrlState
    : { bottom: 0, top: 1 };
  const [sliceActive, setSliceActive] = useState<boolean>(false);

  const [sliceState, setSliceState] = useState<SliceState>({
    minHeight: 0,
    maxHeight: 0,
    topRatio: initialTopRatio,
    bottomRatio: initialBottomRatio
  });

  const { minHeight, maxHeight, topRatio, bottomRatio } = sliceState;

  useEffect(() => {
    if (models.length === 0) {
      return;
    }

    const box = new Box3();
    models.forEach((model) => box.union(model.getModelBoundingBox(undefined, true)));

    const newMaxY = box.max.y;
    const newMinY = box.min.y;

    if (maxHeight !== newMaxY || minHeight !== newMinY) {
      // Set clipping plane only if top or bottom has changed & storeStateInUrl is enabled

      if (storeStateInUrl && (bottomRatio !== 0 || topRatio !== 1)) {
        setGlobalPlanes(bottomRatio, topRatio, newMaxY, newMinY);
      }

      setSliceState({
        maxHeight: newMaxY,
        minHeight: newMinY,
        topRatio,
        bottomRatio
      });
    }
  }, [models]);

  function changeSlicingState(newValues: number[]): void {
    setGlobalPlanes(newValues[0], newValues[1], maxHeight, minHeight);

    setSliceState({
      maxHeight,
      minHeight,
      bottomRatio: newValues[0],
      topRatio: newValues[1]
    });

    if (storeStateInUrl) {
      setSlicerUrlState(newValues);
    }
  }

  function setGlobalPlanes(
    bottomRatio: number,
    topRatio: number,
    maxHeight: number,
    minHeight: number
  ): void {
    const planes: Plane[] = [];

    if (bottomRatio !== 0) {
      planes.push(
        new Plane(new Vector3(0, 1, 0), -(minHeight + bottomRatio * (maxHeight - minHeight)))
      );
    }

    if (topRatio !== 1) {
      planes.push(new Plane(new Vector3(0, -1, 0), minHeight + topRatio * (maxHeight - minHeight)));
    }

    viewer.setGlobalClippingPlanes(planes);
  }

  return (
    <CogsTooltip content={t('SLICE_TOOLTIP', 'Slice')} placement="right" appendTo={document.body}>
      <Dropdown
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
          icon=<SliceIcon />
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

const StyledMenu = styled(Menu)`
  height: 512px;
  padding: 12px;
  min-width: 0px;
`;
