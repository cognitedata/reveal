/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type Image360Collection } from '@cognite/reveal';

export const Image360CollectionLayerContainer = (): ReactElement => {
  const viewer = useReveal();
  const image360Collection = viewer.get360ImageCollections();

  const [selectedImage360Collection, setSelectedImage360Collection] = useState<
    Array<{ image360: Image360Collection; isToggled: boolean }>
  >(
    image360Collection.map((image360Collection) => ({
      image360: image360Collection,
      isToggled: true
    }))
  );

  const [all360ImagesVisible, setAll360ImagesVisible] = useState(true);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);

  const count = image360Collection.length.toString();

  const handle360ImagesVisibility = (image360: Image360Collection): void => {
    selectedImage360Collection.map((data) => {
      if (data.image360 === image360) {
        data.isToggled = !data.isToggled;
        image360.setIconsVisibility(data.isToggled);
      }
      return data;
    });
    viewer.requestRedraw();
    setSelectedImage360Collection([...selectedImage360Collection]);
    setIndeterminate(selectedImage360Collection.some((data) => !data.isToggled));
    setAll360ImagesVisible(!selectedImage360Collection.every((data) => !data.isToggled));
  };

  const handleAll360ImagesVisibility = (visible: boolean): void => {
    selectedImage360Collection.forEach((data) => {
      data.isToggled = visible;
      data.image360.setIconsVisibility(data.isToggled);
    });
    viewer.requestRedraw();
    setAll360ImagesVisible(visible);
    setIndeterminate(false);
    setSelectedImage360Collection([...selectedImage360Collection]);
  };

  const image360Content = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
        {selectedImage360Collection.map((data) => (
          <Menu.Item
            key={data.image360.id}
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
    <Menu.Submenu content={image360Content()} title="360 images">
      <Flex direction="row" justifyContent="space-between">
        <Checkbox
          checked={all360ImagesVisible}
          indeterminate={indeterminate}
          onChange={(e, c) => {
            e.stopPropagation();
            handleAll360ImagesVisibility(c as boolean);
          }}
        />
        <StyledLabel> 360 images </StyledLabel>
        <StyledChipCount label={count} hideTooltip />
      </Flex>
    </Menu.Submenu>
  );
};
