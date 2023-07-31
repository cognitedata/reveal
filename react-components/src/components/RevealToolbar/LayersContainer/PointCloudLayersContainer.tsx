/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';
// import { use3DModelName } from '../../../hooks/use3DModelName';
import uniqueId from 'lodash/uniqueId';

type PointCloudLayersContainerProps = {
  selectedPointCloudModels: Array<{
    model: CognitePointCloudModel;
    isToggled: boolean;
    name?: string;
  }>;
  setSelectedPointCloudModels: (
    value: Array<{ model: CognitePointCloudModel; isToggled: boolean; name?: string }>
  ) => void;
  allPointCloudModelVisible: boolean;
  setAllPointCloudModelVisible: (value: boolean) => void;
  indeterminate: boolean;
  setIndeterminate: (value: boolean) => void;
};

export const PointCloudLayersContainer = ({
  selectedPointCloudModels,
  setSelectedPointCloudModels,
  allPointCloudModelVisible,
  setAllPointCloudModelVisible,
  indeterminate,
  setIndeterminate
}: PointCloudLayersContainerProps): ReactElement => {
  const viewer = useReveal();
  const count = selectedPointCloudModels.length.toString();

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
        <StyledChipCount label={count} hideTooltip type="neutral" />
      </Flex>
    </Menu.Submenu>
  );
};
