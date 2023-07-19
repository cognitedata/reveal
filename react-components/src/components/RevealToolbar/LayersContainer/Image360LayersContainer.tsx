/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { Menu } from '@cognite/cogs.js';
import { StyledCheckbox, StyledSubMenu, StyledMenu } from './elements';
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
  };

  const handleAll360ImagesVisibility = (visible: boolean): void => {
    selectedImage360Collection.forEach((data) => {
      data.isToggled = visible;
      data.image360.setIconsVisibility(data.isToggled);
    });
    viewer.requestRedraw();
    setAll360ImagesVisible(visible);
    setSelectedImage360Collection([...selectedImage360Collection]);
  };

  const image360Content = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
        <>
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
        </>
      </StyledSubMenu>
    );
  };

  return (
    <>
      {selectedImage360Collection.length > 0 ? (
        <StyledMenu>
          <StyledCheckbox
            checked={all360ImagesVisible}
            onChange={(e, c) => {
              e.stopPropagation();
              handleAll360ImagesVisibility(c as boolean);
            }}
          />
          <Menu.Submenu content={image360Content()}>360 images</Menu.Submenu>
        </StyledMenu>
      ) : (
        <></>
      )}
    </>
  );
};
