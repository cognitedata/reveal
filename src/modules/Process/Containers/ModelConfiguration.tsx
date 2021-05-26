import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Title } from '@cognite/cogs.js';

import styled from 'styled-components';

import * as tagDetectionModelDetails from './ModelDetails/TagDetectionModelDetails';
import * as objectDetectionModelDetails from './ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from './ModelDetails/OcrModelDetails';

const queryClient = new QueryClient();

export const ModelConfiguration = () => {
  const [currentModelSettings, setCurrentModelSettings] = useState('ocr');

  const modelData = {
    ocr: {
      badge: ocrModelDetails.badge(),
      description: ocrModelDetails.description(),
      content: ocrModelDetails.content(),
    },
    tagDetection: {
      badge: tagDetectionModelDetails.badge(),
      description: tagDetectionModelDetails.description(),
      content: tagDetectionModelDetails.content(),
    },
    objectDetection: {
      badge: objectDetectionModelDetails.badge(),
      description: objectDetectionModelDetails.description(),
      content: objectDetectionModelDetails.content(),
    },
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Model settings</Title>
        <Container>
          <CarouselLeftContainer>
            {Object.entries(modelData).map((pair) => (
              <>
                <FancyButton
                  key={`${pair[0]}_focused`}
                  style={{
                    background:
                      currentModelSettings === pair[0]
                        ? 'rgba(74, 103, 251, 0.1)'
                        : 'white',
                    border:
                      currentModelSettings === pair[0]
                        ? '1px solid #4A67FB'
                        : undefined,
                  }}
                  onClick={() => {
                    setCurrentModelSettings(pair[0]);
                  }}
                >
                  <NameContainer>
                    {pair[1].badge}
                    {pair[1].description}
                  </NameContainer>
                </FancyButton>
              </>
            ))}
          </CarouselLeftContainer>

          {['ocr', 'objectDetection', 'tagDetection'].includes(
            currentModelSettings
          ) && (
            <CarouselRightContainer key={currentModelSettings}>
              {(modelData as any)[currentModelSettings].content}
            </CarouselRightContainer>
          )}
        </Container>
      </QueryClientProvider>
    </>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  border-radius: 6px;
  margin-top: 12px;
`;

const CarouselLeftContainer = styled.div`
  display: flex;
  width: 300px;
  flex-direction: column;
  align-items: flex-start;

  padding-right: 20px;
  row-gap: 16px;
`;

const CarouselRightContainer = styled.div`
  display: grid;
  width: calc(100% - 300px);
  overflow-y: auto;
  background: white;
  padding: 17px;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  text-align: left;
`;

const FancyButton = styled.div`
  background: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  width: 98%;
`;
