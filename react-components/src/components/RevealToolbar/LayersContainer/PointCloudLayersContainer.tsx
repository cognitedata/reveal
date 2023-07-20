/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Menu } from '@cognite/cogs.js';
import { StyledCheckbox, StyledSubMenu, StyledMenu } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';

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
  const [indeterminate, setIndeterminate] = useState<boolean>(false);

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
    setIndeterminate(selectedPointCloudModels.some((data) => !data.isToggled));
    setAllPointCloudModelVisible(!selectedPointCloudModels.every((data) => !data.isToggled));
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

  const pointCloudModelContent = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
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
      </StyledSubMenu>
    );
  };

  return (
    <>
      {selectedPointCloudModels.length > 0 ? (
        <StyledMenu>
          <StyledCheckbox
            checked={allPointCloudModelVisible}
            indeterminate={indeterminate}
            onChange={(e, c) => {
              e.stopPropagation();
              handleAllPointCloudModelsVisibility(c as boolean);
            }}
          />
          <Menu.Submenu content={pointCloudModelContent()}>Point clouds</Menu.Submenu>
        </StyledMenu>
      ) : (
        <></>
      )}
    </>
  );
};
