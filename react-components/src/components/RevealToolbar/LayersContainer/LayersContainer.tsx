/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, type ReactElement, useState } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { CogniteCadModel } from '@cognite/reveal';

export const LayersContainer = (): ReactElement => {
  const viewer = useReveal();
  const cadModels = viewer.models.filter((model) => model.type === 'cad');
  const pointCloudModels = viewer.models.filter((model) => model.type === 'pointcloud');

  const [cadModelVisible, setCadModelVisible] = useState(true);

  const handleCadModelVisibility = (model: CogniteCadModel) => {
    model.visible = !model.visible;
    viewer.requestRedraw();
  };

  const handleAllCadModelsVisibility = (visible: boolean) => {
    cadModels.forEach((model) => {
      (model as CogniteCadModel).visible = visible;
    });
    viewer.requestRedraw();
  };

  const cadModelContent = () => {
    return (<Menu>
      {cadModels.length ? (
        <>
          {
            cadModels.map((model) => <Menu.Item
             key={model.modelId}
             toggled = {(model as CogniteCadModel).visible}
             hasCheckbox
             onClick={() => handleCadModelVisibility(model as CogniteCadModel)}>
              {model.modelId}
            </Menu.Item>)
          }
        </>
      )
      : <Menu.Item>No CAD models</Menu.Item>}
    </Menu>);
  };

  return (
    <Container>
      <StyleMenu>
        <StyledCheckbox
            checked={cadModelVisible}
            onChange={(_, c) => handleAllCadModelsVisibility(!!c)}
          />
          <Menu.Submenu content = {cadModelContent()}>
            CAD models
          </Menu.Submenu>
      </StyleMenu>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  left: calc(100% + 10px);
  top: calc(0%);
`;

// const InnerMenuItemContainer = styled(Menu.Item)`
//   position: absolute;
//   left: calc(100% + 10px);
//   top: calc(0%);
// `;

const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`;

const StyleMenu = styled(Menu)`
  display: flex;
  flex-direction: column;
`;
