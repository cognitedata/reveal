import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Select, Body, Button, Detail } from '@cognite/cogs.js';

import styled from 'styled-components';

import { RootState } from 'src/store/rootReducer';
import { useSelector } from 'react-redux';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { AutoMLModelCore } from 'src/api/vision/autoML/types';
import { BUILT_IN_MODEL_COUNT } from 'src/modules/Process/store/slice';
import * as tagDetectionModelDetails from './ModelDetails/TagDetectionModelDetails';
import * as objectDetectionModelDetails from './ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from './ModelDetails/OcrModelDetails';
import * as customModelDetails from './ModelDetails/customModelDetails';

const queryClient = new QueryClient();

type SelectOption = {
  label: any;
  value: number;
  modelType?: VisionDetectionModelType;
  content: any;
};

const BadgeWrapper = (modelName: string, badge: JSX.Element) => {
  return (
    <StyledBadgeRow>
      {badge}
      <Detail strong>{` ${modelName}`}</Detail>
    </StyledBadgeRow>
  );
};

export const ModelConfiguration = (props: {
  disabledModelTypes: VisionDetectionModelType[];
  customModels?: AutoMLModelCore[];
  handleCustomModelCreate: () => void;
}) => {
  const availableDetectionModels = useSelector(
    (state: RootState) => state.processSlice.availableDetectionModels
  );

  const [currentModelSettings, setCurrentModelSettings] = useState(
    // show custom model settings if custom model added and automl is enabled
    availableDetectionModels.length > 3 &&
      !props.disabledModelTypes.includes(VisionDetectionModelType.CustomModel)
      ? availableDetectionModels.length - 1
      : 0
  );

  // WORKAROUND: Always generate the contents of the custom model page.
  // Custom models may not initially be available. However, they can be added by
  // using the "Add custom model button".  As per the rules of hooks, we cannot
  // use hooks inside conditionals. When the user clicks on the "Add custom
  // model" button we conditionally use the hooks inside the
  // customModelDetails.content function. By always generating the contents, we
  // avoid conditionally calling the hooks.
  const customModelDetailsContent = customModelDetails.content(
    BUILT_IN_MODEL_COUNT,
    props.customModels
  );

  const enabledDetectionModels = availableDetectionModels.filter(
    (item) => !props.disabledModelTypes.includes(item.type)
  );
  const modelSelectOptions: SelectOption[] = enabledDetectionModels.map(
    // eslint-disable-next-line consistent-return
    (item, index) => {
      let labelAndContent;
      const hideText = true;
      switch (item.type) {
        case VisionDetectionModelType.OCR:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              ocrModelDetails.badge(item.modelName, hideText)
            ),
            content: ocrModelDetails.content(index),
          };
          break;

        case VisionDetectionModelType.TagDetection:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              tagDetectionModelDetails.badge(item.modelName, hideText)
            ),
            content: tagDetectionModelDetails.content(index),
          };
          break;

        case VisionDetectionModelType.ObjectDetection:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              objectDetectionModelDetails.badge(item.modelName, hideText)
            ),
            content: objectDetectionModelDetails.content(index),
          };
          break;
        case VisionDetectionModelType.CustomModel:
          labelAndContent = {
            label: BadgeWrapper(
              item.modelName,
              customModelDetails.badge(item.modelName, hideText)
            ),
            content: customModelDetailsContent,
          };
          break;
      }
      return { ...labelAndContent, value: index, modelType: item.type };
    }
  );

  const addCustomModelOption = {
    label: (
      <StyledButton icon="PlusCompact" type="ghost">
        Add custom model
      </StyledButton>
    ),
    value: BUILT_IN_MODEL_COUNT,
    content: customModelDetailsContent,
    modelType: undefined,
  };
  const options =
    // Show create if custom model not already added and if it is enabled
    modelSelectOptions.length > BUILT_IN_MODEL_COUNT ||
    props.disabledModelTypes.includes(VisionDetectionModelType.CustomModel)
      ? modelSelectOptions
      : [...modelSelectOptions, addCustomModelOption];

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Container>
          <ModelSelectContainer>
            <Body> Annotation Model</Body>
            <div style={{ width: '255px', marginTop: '6px' }}>
              <Select
                closeMenuOnSelect
                value={options.filter(
                  (item) => item.value === currentModelSettings
                )}
                onChange={(option: any) => {
                  // We handle model creation here instead of in an onClick for
                  // the button. This is because the user may be able to click
                  // outside the dropdown, yet inside the dropdown select.
                  if (!option.modelType) props.handleCustomModelCreate();
                  setCurrentModelSettings(option.value);
                }}
                options={options}
                disableTyping
              />
            </div>
          </ModelSelectContainer>
          <ModelSettingsContainer>
            {
              modelSelectOptions.find(
                (item) => item.value === currentModelSettings
              )?.content
            }
          </ModelSettingsContainer>
        </Container>
      </QueryClientProvider>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 6px;
  border: 0;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 10px;
`;

const ModelSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 22px;
  margin-left: 22px;
`;

const ModelSettingsContainer = styled.div`
  display: grid;
  width: 100%;
  background: white;
  padding-left: 15px;
  padding-bottom: 15px;
  border-radius: 10px;
`;

const StyledButton = styled(Button)`
  width: 100%;
  justify-content: start;
  &:hover {
    background: none;
  }
`;

const StyledBadgeRow = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-items: center;
  .cogs-icon {
    margin-right: 0;
  }
`;
