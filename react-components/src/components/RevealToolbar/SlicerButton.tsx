/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';

import { Box3, Plane, Vector3 } from 'three';

import { useReveal } from '../RevealCanvas/ViewerContext';
import { Button, RangeSlider, Tooltip as CogsTooltip, SliceIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';

import styled from 'styled-components';
import { useTranslation } from '../i18n/I18n';
import { use3dModels } from '../../hooks/use3dModels';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';
import { offset } from '@floating-ui/dom';

type SliceState = {
  minHeight: number;
  maxHeight: number;
  topRatio: number;
  bottomRatio: number;
};

export const SlicerButton = (): ReactElement => {
  const viewer = useReveal();
  const { t } = useTranslation();
  const models = use3dModels();
  const { bottom: initialBottomRatio, top: initialTopRatio } = { bottom: 0, top: 1 };

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
    <StyledMenu
      placement="right-start"
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      renderTrigger={(props: any) => (
        <CogsTooltip content={t({ key: 'SLICE_TOOLTIP' })} placement="right">
          <Button {...props} type="ghost" icon=<SliceIcon /> aria-label="Slice models" />
        </CogsTooltip>
      )}>
      <StyledRangeSlider
        min={0}
        max={1}
        step={0.01}
        setValue={changeSlicingState}
        marks={{}}
        value={[bottomRatio, topRatio]}
        vertical
      />
    </StyledMenu>
  );
};

const StyledMenu = styled(Menu)`
  height: 512px;
  width: 32px !important;
  max-width: 32px !important;
  min-width: 32px !important;
  padding: 12px 8px 12px 8px !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;

  .cogs-v10.cogs-slider .rc-slider-rail {
    height: 100% !important;
    width: 4px !important;
`;

const StyledRangeSlider = styled(RangeSlider)`
  height: 100% !important;
  width: 4px !important;
  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
}
`;
