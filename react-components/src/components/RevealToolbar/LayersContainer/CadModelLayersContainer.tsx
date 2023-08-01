/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type CogniteCadModel } from '@cognite/reveal';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import uniqueId from 'lodash/uniqueId';
import { type Reveal3DResourcesLayersProps } from './types';

export const CadModelLayersContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const viewer = useReveal();

  const { cadModels } = layerProps.reveal3DResourcesStates;

  const count = cadModels.length.toString();
  const allModelVisible = !cadModels.every((data) => !data.isToggled);
  const indeterminate = cadModels.some((data) => !data.isToggled);

  const handleCadModelVisibility = (model: CogniteCadModel): void => {
    const updatedSelectedCadModels = cadModels.map((data) => {
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
    layerProps.setReveal3DResourcesStates((prevResourcesStates) => ({
      ...prevResourcesStates,
      cadModels: updatedSelectedCadModels
    }));
  };

  const handleAllCadModelsVisibility = (visible: boolean): void => {
    const updatedSelectedCadModels = cadModels.map((data) => ({
      ...data,
      isToggled: visible
    }));
    updatedSelectedCadModels.forEach((data) => {
      data.model.visible = visible;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesStates((prevResourcesStates) => ({
      ...prevResourcesStates,
      cadModels: updatedSelectedCadModels
    }));
  };

  const cadModelContent = (): React.JSX.Element => {
    return (
      <StyledSubMenu>
        {cadModels.map((data) => (
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
    <>
      {cadModels.length > 0 && (
        <Menu.Submenu content={cadModelContent()} title="CAD models">
          <Flex direction="row" justifyContent="space-between" gap={4}>
            <Checkbox
              key={`allCadModelCheckbox-${String(allModelVisible)}-${String(indeterminate)}`}
              checked={allModelVisible}
              indeterminate={indeterminate}
              onChange={(e, c) => {
                e.stopPropagation();
                handleAllCadModelsVisibility(c as boolean);
              }}
            />
            <StyledLabel> CAD models </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </>
  );
};
