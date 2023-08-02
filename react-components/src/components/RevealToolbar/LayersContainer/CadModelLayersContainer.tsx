/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
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

  const { cadLayerData } = layerProps.reveal3DResourcesLayerData;

  const count = cadLayerData.length.toString();
  const someModelVisible = !cadLayerData.every((data) => !data.isToggled);
  const indeterminate = cadLayerData.some((data) => !data.isToggled);

  const handleCadModelVisibility = (model: CogniteCadModel): void => {
    const updatedSelectedCadModels = cadLayerData.map((data) => {
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
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      cadLayerData: updatedSelectedCadModels
    }));
  };

  const handleAllCadModelsVisibility = (visible: boolean): void => {
    const updatedSelectedCadModels = cadLayerData.map((data) => ({
      ...data,
      isToggled: visible
    }));
    updatedSelectedCadModels.forEach((data) => {
      data.model.visible = visible;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      cadLayerData: updatedSelectedCadModels
    }));
  };

  const cadModelContent = (): ReactElement => {
    return (
      <StyledSubMenu>
        {cadLayerData.map((data) => (
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
      {cadLayerData.length > 0 && (
        <Menu.Submenu content={cadModelContent()} title="CAD models">
          <Flex direction="row" justifyContent="space-between" gap={4}>
            <Checkbox
              checked={someModelVisible}
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
