import { Body, Button, Detail, Title } from '@cognite/cogs.js';
import { DocumentsPipelineClassifier } from '@cognite/sdk-playground';
import { Loading } from 'components/states/Loading';
import React from 'react';
import { useDocumentsPipelinesQuery } from 'services/query/documents/query';
import styled from 'styled-components';

const Wrapper = styled.div`
  /* height: 3.25rem; */
  background-color: rgba(74, 103, 251, 0.1);
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
        <Detail>{pipeline?.trainingLabels.length} training labels</Detail>
      </Wrapper>
    </Container>
  );
};

const ClassifierAdd: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  return (
    <Button icon="PlusCompact" type="ghost" disabled={disabled}>
      New classifier
    </Button>
  );
};

export const ClassifierWidget: React.FC = () => {
  const { data, isLoading } = useDocumentsPipelinesQuery();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Title level={4}>Classifier list</Title>
      <ClassifierList pipeline={data?.classifier} />
      <ClassifierAdd disabled={!!data?.classifier} />
    </>
  );
};

export default ClassifierWidget;
