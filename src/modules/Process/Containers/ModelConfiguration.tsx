import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Select, Body } from '@cognite/cogs.js';

import styled from 'styled-components';

import * as tagDetectionModelDetails from './ModelDetails/TagDetectionModelDetails';
import * as objectDetectionModelDetails from './ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from './ModelDetails/OcrModelDetails';

const queryClient = new QueryClient();

export const ModelConfiguration = () => {
  const [currentModelSettings, setCurrentModelSettings] = useState('ocr');

  const modelSelectOptions = [
    {
      label: 'Text detection',
      value: 'ocr',
      content: ocrModelDetails.content(),
    },
    {
      label: 'Asset tag detection',
      value: 'tagDetection',
      content: tagDetectionModelDetails.content(),
    },
    {
      label: 'Object detection',
      value: 'objectDetection',
      content: objectDetectionModelDetails.content(),
    },
  ];

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
  overflow-y: auto;
  background: white;
  padding-left: 15px;
  padding-bottom: 15px;
  border-radius: 10px;
`;
