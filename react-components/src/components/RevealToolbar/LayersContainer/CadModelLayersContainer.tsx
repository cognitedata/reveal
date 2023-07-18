/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type CogniteCadModel } from '@cognite/reveal';
import { Divider, Menu } from '@cognite/cogs.js';
import { StyledCheckbox, StyledSubMenu, StyledMenu, StyledSubMenuWrapper } from './elements';
import { OpacitySlider } from './OpacitySlider';

export const CadModelLayersContainer = (): ReactElement => {
  const viewer = useReveal();
  const cadModels = viewer.models.filter((model) => model.type === 'cad');

  const [selectedCadModels, setSelectedCadModels] = useState<
    Array<{ model: CogniteCadModel; isToggled: boolean }>
  >(
    cadModels.map((model) => ({
      model: model as CogniteCadModel,
      isToggled: (model as CogniteCadModel).visible
    }))
  );

  const [allCadModelVisible, setAllCadModelVisible] = useState(true);

  const handleCadModelVisibility = (model: CogniteCadModel): void => {
    selectedCadModels.map((data) => {
      if (data.model === model) {
        data.isToggled = !data.isToggled;
      }
      return data;
    });
    model.visible = !model.visible;
    viewer.requestRedraw();
    setSelectedCadModels([...selectedCadModels]);
  };

  const handleAllCadModelsVisibility = (visible: boolean): void => {
    selectedCadModels.forEach((data) => {
      data.isToggled = visible;
      data.model.visible = visible;
    });
    viewer.requestRedraw();
    setAllCadModelVisible(visible);
    setSelectedCadModels([...selectedCadModels]);
  };

  const onOpacityChange = (opacity: number): void => {
    console.log('Point Cloud Opacity: ', opacity);
  };

  const cadModelContent = (): React.JSX.Element => {
    return (
      <StyledSubMenuWrapper label={'Opacity'}>
        <OpacitySlider onChange={onOpacityChange} />
        <Divider />
        <StyledSubMenu>
          {selectedCadModels.length > 0 ? (
            <>
              {selectedCadModels.map((data) => (
                <Menu.Item
                  key={data.model.modelId}
                  hasCheckbox
                  checkboxProps={{
                    checked: data.isToggled,
                    onChange: (e: { stopPropagation: () => void }) => {
                      e.stopPropagation();
                      handleCadModelVisibility(data.model);
                    }
                  }}>
                  {data.model.modelId}
                </Menu.Item>
              ))}
            </>
          ) : (
            <Menu.Item>No CAD models</Menu.Item>
          )}
        </StyledSubMenu>
      </StyledSubMenuWrapper>
    );
  };

  return (
    <StyledMenu>
      <StyledCheckbox
        checked={allCadModelVisible}
        onChange={(e, c) => {
          e.stopPropagation();
          handleAllCadModelsVisibility(c as boolean);
        }}
      />
      <Menu.Submenu content={cadModelContent()}>CAD models</Menu.Submenu>
    </StyledMenu>
  );
};
