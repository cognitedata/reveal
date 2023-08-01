/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';
import uniqueId from 'lodash/uniqueId';
import { type Reveal3DResourcesLayersProps } from './types';

export const PointCloudLayersContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const viewer = useReveal();
  const { pointCloudModels } = layerProps.reveal3DResourcesStates;
  const count = pointCloudModels.length.toString();
  const allModelVisible = !pointCloudModels.every((data) => !data.isToggled);
  const indeterminate = pointCloudModels.some((data) => !data.isToggled);

  const handlePointCloudVisibility = (model: CognitePointCloudModel): void => {
    const updatedPointCloudModels = pointCloudModels.map((data) => {
      if (data.model === model) {
        data.isToggled = !data.isToggled;
        model.setDefaultPointCloudAppearance({ visible: data.isToggled });
      }
      return data;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesStates((prevResourcesStates) => ({
      ...prevResourcesStates,
      pointCloudModels: updatedPointCloudModels
    }));
  };

  const handleAllPointCloudModelsVisibility = (visible: boolean): void => {
    pointCloudModels.forEach((data) => {
      data.isToggled = visible;
      data.model.setDefaultPointCloudAppearance({ visible });
    });
    viewer.requestRedraw();

    layerProps.setReveal3DResourcesStates((prevResourcesStates) => ({
      ...prevResourcesStates,
      pointCloudModels
    }));
  };

  const pointCloudModelContent = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
        {pointCloudModels.map((data) => (
          <Menu.Item
            key={uniqueId()}
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
    <>
      {pointCloudModels.length > 0 && (
        <Menu.Submenu openOnHover={false} content={pointCloudModelContent()} title="Point clouds">
          <Flex direction="row" justifyContent="space-between">
            <Checkbox
              key={`allPointCLoudModelCheckbox-${String(allModelVisible)}-${String(indeterminate)}`}
              checked={allModelVisible}
              indeterminate={indeterminate}
              onChange={(e, c) => {
                e.stopPropagation();
                handleAllPointCloudModelsVisibility(c as boolean);
              }}
            />
            <StyledLabel> Point clouds </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </>
  );
};
