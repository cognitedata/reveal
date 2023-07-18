/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Divider, Menu } from '@cognite/cogs.js';
import { StyledCheckbox, StyledSubMenu, StyledMenu, StyledSubMenuWrapper } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';
import { OpacitySlider } from './OpacitySlider';

export const PointCloudLayersContainer = (): ReactElement => {
  const viewer = useReveal();
  const pointCloudModels = viewer.models.filter((model) => model.type === 'pointcloud');

  const [selectedPointCloudModels, setSelectedPointCloudModels] = useState<
    Array<{ model: CognitePointCloudModel; isToggled: boolean }>
  >(
    pointCloudModels.map((model) => ({
      model: model as CognitePointCloudModel,
      isToggled: (model as CognitePointCloudModel).getDefaultPointCloudAppearance().visible ?? true
    }))
  );

  const [allPointCloudModelVisible, setAllPointCloudModelVisible] = useState(true);

  const handlePointCloudVisibility = (model: CognitePointCloudModel): void => {
    selectedPointCloudModels.map((data) => {
      if (data.model === model) {
        data.isToggled = !data.isToggled;
        model.setDefaultPointCloudAppearance({ visible: data.isToggled });
      }
      return data;
    });
    viewer.requestRedraw();
    setSelectedPointCloudModels([...selectedPointCloudModels]);
  };

  const handleAllPointCloudModelsVisibility = (visible: boolean): void => {
    selectedPointCloudModels.forEach((data) => {
      data.isToggled = visible;
      data.model.setDefaultPointCloudAppearance({ visible });
    });
    viewer.requestRedraw();
    setAllPointCloudModelVisible(visible);
    setSelectedPointCloudModels([...selectedPointCloudModels]);
  };

  const onOpacityChange = (opacity: number): void => {
    console.log('Point Cloud Opacity: ', opacity);
  };

  const pointCloudModelContent = (): React.JSX.Element => {
    return (
      <StyledSubMenuWrapper label={'Opacity'}>
        <OpacitySlider onChange={onOpacityChange} />
        <Divider />
        <StyledSubMenu>
          {selectedPointCloudModels.length > 0 ? (
            <>
              {selectedPointCloudModels.map((data) => (
                <Menu.Item
                  key={data.model.modelId}
                  hasCheckbox
                  checkboxProps={{
                    checked: data.isToggled,
                    onChange: (e: { stopPropagation: () => void }) => {
                      e.stopPropagation();
                      handlePointCloudVisibility(data.model);
                    }
                  }}>
                  {data.model.modelId}
                </Menu.Item>
              ))}
            </>
          ) : (
            <Menu.Item>No Point Cloud</Menu.Item>
          )}
        </StyledSubMenu>
      </StyledSubMenuWrapper>
    );
  };

  return (
    <StyledMenu>
      <StyledCheckbox
        checked={allPointCloudModelVisible}
        onChange={(e, c) => {
          e.stopPropagation();
          handleAllPointCloudModelsVisibility(c as boolean);
        }}
      />
      <Menu.Submenu content={pointCloudModelContent()}>Point clouds</Menu.Submenu>
    </StyledMenu>
  );
};
