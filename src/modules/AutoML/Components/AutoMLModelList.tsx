/* eslint-disable no-nested-ternary */
/* eslint-disable @cognite/no-number-z-index */
import React from 'react';
import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AutoMLModel } from 'src/api/autoML/types';
import { AutoMLModelListItem } from './AutoMLModelListItem';

export const AutoMLModelList = (props: {
  models?: AutoMLModel[];
  onRowClick: (id: number) => void;
  selectedModelId?: number;
}) => {
  const { models } = props;

  return (
    <Container>
      <TitleBar>
        <Title level={2}>Computer Vision Models</Title>
      </TitleBar>

      {models && models.length ? (
        <Body>
          {models.map((model) => {
            return (
              <AutoMLModelListItem
                key={model.jobId}
                model={model}
                onRowClick={props.onRowClick}
                selectedModelId={props.selectedModelId}
              />
            );
          })}
        </Body>
      ) : models && models.length === 0 ? (
        <StyledBody data-testid="no-model-msg">No models found</StyledBody>
      ) : (
        <StyledIcon data-testid="loading-animation-icon" type="Loading" />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: 45px auto;
  grid-template-columns: 100%;
  grid-gap: 10px;
  margin-bottom: 20px;
  padding: 14px;
  width: 500px;
`;
const Body = styled.div`
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  overflow-y: auto;
  height: 700px;
`;

const TitleBar = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`;

const StyledIcon = styled(Icon)`
  display: flex;
  justify-self: center;
  align-content: center;
`;

const StyledBody = styled(Body)`
  display: flex;
  color: '#00000073';
  justify-content: center;
  align-items: center;
`;
