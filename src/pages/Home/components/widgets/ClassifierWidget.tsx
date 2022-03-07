import { Body, Button, Detail, Title, Tooltip } from '@cognite/cogs.js';
import { DocumentsPipelineClassifier } from '@cognite/sdk-playground';
import React from 'react';
import { useDocumentsPipelinesQuery } from 'src/services/query/pipelines/query';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  border-radius: 6px;
  margin-bottom: 5px;
  padding: 8px 12px;
  cursor: pointer;
`;

export const Container = styled.div`
  margin-top: 1rem;
  margin-bottom: 1.5rem;
`;

const ClassifierList: React.FC<{ pipeline?: DocumentsPipelineClassifier }> = ({
  pipeline,
}) => {
  return (
    <Container>
      <Wrapper>
        <Body level={2} strong>
          {pipeline?.name}
        </Body>
        <Detail>{pipeline?.trainingLabels?.length} training labels</Detail>
      </Wrapper>
    </Container>
  );
};

const ClassifierAdd: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  return (
    <Tooltip
      disabled={!disabled}
      content="Currently, it is only possible to have one classifier in the pipeline"
    >
      <Button icon="AddLarge" type="ghost" disabled={disabled}>
        New classifier
      </Button>
    </Tooltip>
  );
};

export const ClassifierWidget: React.FC = () => {
  const { data } = useDocumentsPipelinesQuery();

  if (!data?.classifier) {
    return null;
  }

  return (
    <>
      <Title level={4}>Classifier list</Title>
      <ClassifierList pipeline={data?.classifier} />
      <ClassifierAdd disabled={Boolean(data?.classifier)} />
    </>
  );
};

export default ClassifierWidget;
