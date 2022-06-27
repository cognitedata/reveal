import React from 'react';
import { Body, Select, Title } from '@cognite/cogs.js';
import { AutoMLModelType } from 'src/api/vision/autoML/types';
import { MAX_AUTOML_MODEL_NAME_LENGTH } from 'src/api/vision/autoML/constants';

import styled from 'styled-components';
import { Input } from 'antd';

type SelectOption = {
  label: any;
  value: AutoMLModelType;
};

export const ModelTrainingSettings = (props: {
  modelName: string;
  onSetModelName: (name: string) => void;
  onSetModelType: (type: AutoMLModelType) => void;
}) => {
  const { modelName, onSetModelName, onSetModelType } = props;
  const options = [
    // Currently only support object detection
    {
      label: 'Object detection',
      value: 'objectdetection',
    },
  ] as SelectOption[];

  return (
    <Container>
      <Title level={5} as="h1">
        Model configuration
      </Title>
      <RowContainer>
        <Body level={2} strong>
          Name
        </Body>
        <Input
          value={modelName}
          placeholder="Add model name"
          onChange={(event) => {
            const { value } = event.target;
            onSetModelName(value);
          }}
          maxLength={MAX_AUTOML_MODEL_NAME_LENGTH}
        />
      </RowContainer>

      <RowContainer>
        <Body level={2} strong>
          Model type
        </Body>
        <Select
          disableTyping
          clearable={false}
          value={options[0]}
          onChange={(item: SelectOption) => {
            onSetModelType(item.value);
          }}
          options={options}
        />
      </RowContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 10px;
`;

const RowContainer = styled.div`
  padding-top: 10px;
  width: 100%;
`;
