/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Select, Body } from '@cognite/cogs.js';

import styled from 'styled-components';

import { RootState } from 'src/store/rootReducer';
import { useSelector } from 'react-redux';
import { VisionAPIType } from 'src/api/vision/detectionModels/types';
import { AutoMLModel } from 'src/api/vision/autoML/types';
import * as tagDetectionModelDetails from './ModelDetails/TagDetectionModelDetails';
import * as objectDetectionModelDetails from './ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from './ModelDetails/OcrModelDetails';
import * as customModelDetails from './ModelDetails/customModelDetails';

const queryClient = new QueryClient();

export const ModelConfiguration = (props: {
  disabledModelTypes: VisionAPIType[];
  customModels?: AutoMLModel[];
}) => {
  const availableDetectionModels = useSelector(
    (state: RootState) => state.processSlice.availableDetectionModels
  );

  const [currentModelSettings, setCurrentModelSettings] = useState(
    // show custom model settings if custom model added and automl is enabled
    availableDetectionModels.length > 3 &&
      !props.disabledModelTypes.includes(VisionAPIType.CustomModel)
      ? availableDetectionModels.length - 1
      : 0
  );

  const enabledDetectionModels = availableDetectionModels.filter(
    (item) => !props.disabledModelTypes.includes(item.type)
  );
  const modelSelectOptions = enabledDetectionModels.map((item, index) => {
    const content =
      item.type === VisionAPIType.OCR
        ? ocrModelDetails.content(index)
        : item.type === VisionAPIType.TagDetection
        ? tagDetectionModelDetails.content(index)
        : item.type === VisionAPIType.ObjectDetection
        ? objectDetectionModelDetails.content(index)
        : item.type === VisionAPIType.CustomModel
        ? customModelDetails.content(index, props.customModels)
        : undefined;

    return {
      label: item.modelName,
      value: index,
      content,
    };
  });

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Container>
          <ModelSelectContainer>
            <Body> Annotation Model</Body>
            <div style={{ width: '255px', marginTop: '6px' }}>
              <Select
                closeMenuOnSelect
                value={modelSelectOptions.filter(
                  (item) => item.value === currentModelSettings
                )}
                onChange={(option: any) => {
                  setCurrentModelSettings(option.value);
                }}
                options={modelSelectOptions}
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
