import React from 'react';

import styled from 'styled-components';

import { Modal } from '@cognite/cogs.js';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';

import { MatrixTable } from '../../../Classifier/pages/ReviewModel/components';
import { ActiveModelContainer } from '../container/ActiveModelContainer';

const Container = styled.div`
  margin-top: 1rem;
`;

export const ReviewModelModal = ({
  classifier,
  visible,
  toggleVisibility,
  onDeployClick,
}: {
  classifier?: Classifier;
  visible?: boolean;
  toggleVisibility: () => void;
  onDeployClick: (classifier?: Classifier) => void;
}) => {
  return (
    <Modal
      size="full-screen"
      title="Review model"
      okText="Deploy model"
      visible={visible}
      onOk={() => onDeployClick(classifier)}
      onCancel={toggleVisibility}
    >
      <Container>
        <ActiveModelContainer classifier={classifier} fullWidth />
        <MatrixTable classifier={classifier} />
      </Container>
    </Modal>
  );
};
