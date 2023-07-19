/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { Divider, Menu } from '@cognite/cogs.js';
import { StyledCheckbox, StyledSubMenu, StyledMenu, StyledSubMenuWrapper } from './elements';
import { type Image360Collection } from '@cognite/reveal';
import { OpacitySlider } from './OpacitySlider';

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

  const onOpacityChange = (opacity: number): void => {
    console.log('360 Images Opacity: ', opacity);
  };

  const image360Content = (): React.JSX.Element => {
    return (
      <StyledSubMenuWrapper label={'Opacity'}>
        <OpacitySlider onChange={onOpacityChange} />
        <Divider />
        <StyledSubMenu>
          {selectedImage360Collection.length > 0 ? (
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
          ) : (
            <Menu.Item>No 360 images</Menu.Item>
          )}
        </StyledSubMenu>
      </StyledSubMenuWrapper>
    );
  };

  return (
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
  );
};
