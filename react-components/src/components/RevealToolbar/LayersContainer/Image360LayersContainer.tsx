/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type Image360Collection } from '@cognite/reveal';
import uniqueId from 'lodash/uniqueId';
import { type Reveal3DResourcesLayersProps } from './types';

export const Image360CollectionLayerContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const viewer = useReveal();
  const { image360Collections } = layerProps.reveal3DResourcesStates;

  const count = image360Collections.length.toString();
  const allModelVisible = !image360Collections.every((data) => !data.isToggled);
  const indeterminate = image360Collections.some((data) => !data.isToggled);

  const handle360ImagesVisibility = (image360: Image360Collection): void => {
    const updatedImage360Collection = image360Collections.map((data) => {
      if (data.image360 === image360) {
        data.isToggled = !data.isToggled;

        image360.setIconsVisibility(data.isToggled);
      }
      return data;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesStates((prevResourcesStates) => ({
      ...prevResourcesStates,
      image360Collections: updatedImage360Collection
    }));
  };

  const handleAll360ImagesVisibility = (visible: boolean): void => {
    [...image360Collections].forEach((data) => {
      data.isToggled = visible;
      data.image360.setIconsVisibility(data.isToggled);
    });
    if (!visible) {
      viewer.exit360Image();
    }
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesStates((prevResourcesStates) => ({
      ...prevResourcesStates,
      image360Collections
    }));
  };

  const image360Content = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
        {image360Collections.map((data) => (
          <Menu.Item
            key={uniqueId()}
            hasCheckbox
            checkboxProps={{
              checked: data.isToggled,
              onChange: (e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handle360ImagesVisibility(data.image360);
              }
            }}>
            {data.image360.label}
          </Menu.Item>
        ))}
      </StyledSubMenu>
    );
  };

  return (
    <>
      {image360Collections.length > 0 && (
        <Menu.Submenu content={image360Content()} title="360 images">
          <Flex direction="row" justifyContent="space-between">
            <Checkbox
              key={`all360ImagesCheckbox-${String(allModelVisible)}-${String(indeterminate)}`}
              checked={allModelVisible}
              indeterminate={indeterminate}
              onChange={(e, c) => {
                e.stopPropagation();
                handleAll360ImagesVisibility(c as boolean);
              }}
            />
            <StyledLabel> 360 images </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </>
  );
};
