import React from 'react';
import { Body, Title } from '@cognite/cogs.js';

import styled from 'styled-components';
import { getContainer } from 'src/utils';
import { Modal } from 'antd';
import sdk from '@cognite/cdf-sdk-singleton';

export const AutoMLPredictionDocModal = (props: {
  selectedModelId?: number | undefined;
  showModal: boolean;
  onCancel: () => void;
}) => {
  const renderContent = () => {
    const postURL = `POST /api/playground/projects/${sdk.project}/context/vision/automl/prediction`;
    const getURL = `GET /api/playground/projects/${sdk.project}/context/vision/automl/prediction/{jobId}`;

    const postBody = JSON.stringify(
      {
        items: [{ fileId: 123 }],
        modelJobId: props.selectedModelId,
        threshold: 0.5,
      },
      null,
      2
    );

    return (
      <Container>
        <Title level={3}>How to use the Prediction API</Title>
        <StyledBody strong>
          You can make predictions directly using the API with a POST request
          to:
          <CodeContainer>{postURL}</CodeContainer>
          with Body:
          <CodeContainer>
            <pre>{postBody}</pre>
          </CodeContainer>
          Make sure to update the fileId. The response of the POST request
          contains a job ID, which can then be used to make subsequent calls to
          check the status and retrieve the results of the job.
          <CodeContainer>{getURL}</CodeContainer>
          For more information, visit our
          <a
            href="https://docs.cognite.com/api/playground/#operation/visionAutoMLPredict"
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            API documentation.
          </a>
        </StyledBody>
      </Container>
    );
  };
  return (
    <Modal
      getContainer={getContainer}
      visible={props.showModal}
      onCancel={props.onCancel}
      width={780}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
        height: '670',
      }}
    >
      {renderContent()}
    </Modal>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;

  overflow-y: auto;
`;

const StyledBody = styled(Body)`
  padding-top: 10px;
`;

const CodeContainer = styled.div`
  max-width: 100%;
  padding: 10px;
  margin-top: 20px;
  margin-bottom: 20px;

  background-color: var(--cogs-greyscale-grey3);
  color: var(--cogs-greyscale-grey7);

  overflow: auto;
  text-overflow: auto;
  white-space: nowrap;
`;
