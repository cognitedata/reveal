/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type Image360Collection } from '@cognite/reveal';
import { uniqueId } from 'lodash';
import { type Reveal3DResourcesLayersProps } from './types';
import { useRevealContainerElement } from '../../RevealContainer/RevealContainerElementContext';
import { useTranslation } from '../../../common/i18n';

export const Image360CollectionLayerContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const { t } = useTranslation();
  const viewer = useReveal();
  const revealContainerElement = useRevealContainerElement();
  const [visible, setVisible] = useState(false);
  const { image360LayerData } = layerProps.reveal3DResourcesLayerData;

  const count = image360LayerData.length.toString();
  const someImagesVisible = !image360LayerData.every((data) => !data.isToggled);
  const indeterminate = image360LayerData.some((data) => !data.isToggled);

  const handle360ImagesVisibility = (image360: Image360Collection): void => {
    const updatedImage360Collection = image360LayerData.map((data) => {
      if (data.image360 === image360) {
        data.isToggled = !data.isToggled;
        // Exit 360 image if it is active
        if (data.isActive) {
          viewer.exit360Image();
        }

        image360.setIconsVisibility(data.isToggled);
      }
      return data;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      image360LayerData: updatedImage360Collection
    }));
  };

  const handleAll360ImagesVisibility = (visible: boolean): void => {
    [...image360LayerData].forEach((data) => {
      data.isToggled = visible;
      data.image360.setIconsVisibility(data.isToggled);
    });
    image360LayerData.some((data) => data.isActive) && viewer.exit360Image();
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      image360LayerData
    }));
  };

  const image360Content = (): ReactElement => {
    return (
      <StyledSubMenu>
        {image360LayerData.map((data) => (
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
      {image360LayerData.length > 0 && (
        <Menu.Submenu
          appendTo={revealContainerElement ?? document.body}
          visible={visible}
          onClickOutside={() => {
            setVisible(false);
          }}
          content={image360Content()}
          title="360 images">
          <Flex
            direction="row"
            justifyContent="space-between"
            onClick={() => {
              setVisible((prevState) => !prevState);
            }}>
            <Checkbox
              checked={someImagesVisible}
              indeterminate={indeterminate}
              onChange={(e) => {
                e.stopPropagation();
                handleAll360ImagesVisibility(e.target.checked);
                setVisible(true);
              }}
            />
            <StyledLabel> {t('IMAGES_360')} </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </>
  );
};
