/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';
import { use3DModelName } from '../../../hooks/use3DModelName';

export const PointCloudLayersContainer = (): ReactElement => {
  const viewer = useReveal();
  const pointCloudModels = viewer.models.filter((model) => model.type === 'pointcloud');
  const pointCloudModelIds = pointCloudModels.map((model) => model.modelId);

  const modelName = use3DModelName(pointCloudModelIds);

  const [selectedPointCloudModels, setSelectedPointCloudModels] = useState<
    Array<{ model: CognitePointCloudModel; isToggled: boolean; name: string }>
  >(
    pointCloudModels.map((model, index) => ({
      model: model as CognitePointCloudModel,
      isToggled: (model as CognitePointCloudModel).getDefaultPointCloudAppearance().visible ?? true,
      name: modelName?.data?.[index] ?? 'No model name'
    }))
  );

  const [allPointCloudModelVisible, setAllPointCloudModelVisible] = useState(true);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);

  const count = pointCloudModels.length.toString();

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
            {data.name}
          </Menu.Item>
        ))}
      </StyledSubMenu>
    );
  };

  return (
    <Menu.Submenu content={pointCloudModelContent()} title="Point clouds">
      <Flex direction="row" justifyContent="space-between">
        <Checkbox
          checked={allPointCloudModelVisible}
          indeterminate={indeterminate}
          onChange={(e, c) => {
            e.stopPropagation();
            handleAllPointCloudModelsVisibility(c as boolean);
          }}
        />
        <StyledLabel> Point clouds </StyledLabel>
        <StyledChipCount label={count} hideTooltip />
      </Flex>
    </Menu.Submenu>
  );
};
