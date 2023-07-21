/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useState } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type CogniteCadModel } from '@cognite/reveal';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { use3DModelName } from '../../../hooks/use3DModelName';
import uniqueId from 'lodash/uniqueId';

export const CadModelLayersContainer = (): ReactElement => {
  const viewer = useReveal();
  const cadModels = viewer.models.filter((model) => model.type === 'cad');
  const cadModelIds = cadModels.map((model) => model.modelId);

  const modelName = use3DModelName(cadModelIds);

  const [selectedCadModels, setSelectedCadModels] = useState<
    Array<{ model: CogniteCadModel; isToggled: boolean; name: string }>
  >(
    cadModels.map((model, index) => ({
      model: model as CogniteCadModel,
      isToggled: (model as CogniteCadModel).visible,
      name: modelName?.data?.[index] ?? 'No model name'
    }))
  );

  const [allCadModelVisible, setAllCadModelVisible] = useState(true);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);

  const count = selectedCadModels.length.toString();

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
    setIndeterminate(selectedCadModels.some((data) => !data.isToggled));
    setAllCadModelVisible(!selectedCadModels.every((data) => !data.isToggled));
  };

  const handleAllCadModelsVisibility = (visible: boolean): void => {
    selectedCadModels.forEach((data) => {
      data.isToggled = visible;
      data.model.visible = visible;
    });
    viewer.requestRedraw();
    setAllCadModelVisible(visible);
    setIndeterminate(false);
    setSelectedCadModels([...selectedCadModels]);
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
          indeterminate={indeterminate}
          onChange={(e, c) => {
            e.stopPropagation();
            handleAllCadModelsVisibility(c as boolean);
          }}
        />
        <StyledLabel> CAD models </StyledLabel>
        <StyledChipCount label={count} hideTooltip />
      </Flex>
    </Menu.Submenu>
  );
};
