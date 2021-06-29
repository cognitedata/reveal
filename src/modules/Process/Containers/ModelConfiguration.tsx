import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Row, Col } from '@cognite/cogs.js';

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
                  <Row
                    cols={12}
                    style={{ alignContent: 'center', gap: '16px !important' }}
                  >
                    <StyledCol span={9}>
                      <NameContainer>
                        {pair[1].badge}
                        {pair[1].description}
                      </NameContainer>
                    </StyledCol>
                    <StyledCol span={2}>
                      <div />
                    </StyledCol>
                    <StyledCol span={1}>
                      <input
                        type="radio"
                        name={`${pair[0]}_focused`}
                        id={`${pair[0]}_focused`}
                        checked={currentModelSettings === pair[0]}
                        onChange={() => {}} // added to avoid warning
                      />
                    </StyledCol>
                  </Row>
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
  border: 0;
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
  border: 1px solid #d9d9d9;
  border-radius: 10px;
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
  border: 1px solid #d9d9d9;
  border-radius: 10px;
`;

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
`;
