/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type CogniteCadModel } from '@cognite/reveal';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import uniqueId from 'lodash/uniqueId';

type CadModelLayersContainerProps = {
  selectedCadModels: Array<{ model: CogniteCadModel; isToggled: boolean; name?: string }>;
  setSelectedCadModels: (
    value: Array<{ model: CogniteCadModel; isToggled: boolean; name?: string }>
  ) => void;
  allCadModelVisible: boolean;
  setAllCadModelVisible: (value: boolean) => void;
  cadIndeterminate: boolean;
  setCadIndeterminate: (value: boolean) => void;
};

export const CadModelLayersContainer = ({
  selectedCadModels,
  setSelectedCadModels,
  allCadModelVisible,
  setAllCadModelVisible,
  cadIndeterminate,
  setCadIndeterminate
}: CadModelLayersContainerProps): ReactElement => {
  const viewer = useReveal();

  const count = selectedCadModels.length.toString();

  const handleCadModelVisibility = (model: CogniteCadModel): void => {
    const updatedSelectedCadModels = selectedCadModels.map((data) => {
      if (data.model === model) {
        return {
          ...data,
          isToggled: !data.isToggled
        };
      } else {
        return data;
      }
    });
    model.visible = !model.visible;
    viewer.requestRedraw();
    setSelectedCadModels(updatedSelectedCadModels);
    setCadIndeterminate(updatedSelectedCadModels.some((data) => !data.isToggled));
    setAllCadModelVisible(!updatedSelectedCadModels.every((data) => !data.isToggled));
  };

  const handleAllCadModelsVisibility = (visible: boolean): void => {
    const updatedSelectedCadModels = selectedCadModels.map((data) => ({
      ...data,
      isToggled: visible
    }));
    updatedSelectedCadModels.forEach((data) => {
      data.model.visible = visible;
    });
    viewer.requestRedraw();
    setSelectedCadModels(updatedSelectedCadModels);
    setAllCadModelVisible(visible);
    setCadIndeterminate(false);
  };

  const cadModelContent = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
        {selectedCadModels.map((data) => (
          <Menu.Item
            key={uniqueId()}
            hasCheckbox
            checkboxProps={{
              checked: data.isToggled,
              onChange: (e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleCadModelVisibility(data.model);
              }
            }}>
            {data.name}
          </Menu.Item>
        ))}
      </StyledSubMenu>
    );
  };

  return (
    <Menu.Submenu content={cadModelContent()} title="CAD models">
      <Flex direction="row" justifyContent="space-between" gap={4}>
        <Checkbox
          checked={allCadModelVisible}
          indeterminate={cadIndeterminate}
          onChange={(e, c) => {
            e.stopPropagation();
            handleAllCadModelsVisibility(c as boolean);
          }}
        />
        <StyledLabel> CAD models </StyledLabel>
        <StyledChipCount label={count} hideTooltip type="neutral" />
      </Flex>
    </Menu.Submenu>
  );
};
