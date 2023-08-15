/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type CogniteCadModel } from '@cognite/reveal';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { uniqueId } from 'lodash';
import { type Reveal3DResourcesLayersProps } from './types';
import { useRevealContainerElement } from '../../RevealContainer/RevealContainerElementContext';

export const CadModelLayersContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const viewer = useReveal();
  const revealContainerElement = useRevealContainerElement();
  const [visible, setVisible] = useState(false);

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
            hideTooltip={true}
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
        <Menu.Submenu
          appendTo={revealContainerElement ?? document.body}
          visible={visible}
          onClickOutside={() => {
            setVisible(false);
          }}
          content={cadModelContent()}
          title="CAD models">
          <Flex
            direction="row"
            justifyContent="space-between"
            gap={4}
            onClick={() => {
              setVisible((prevState) => !prevState);
            }}>
            <Checkbox
              checked={someModelVisible}
              indeterminate={indeterminate}
              onChange={(e) => {
                e.stopPropagation();
                handleAllCadModelsVisibility(e.target.checked);
                setVisible(true);
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
