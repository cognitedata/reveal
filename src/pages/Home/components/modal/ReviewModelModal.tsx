import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { Modal } from 'components/modal/Modal';
import { ModalProps } from 'components/modal/types';
import { MatrixTable } from 'pages/Classifier/pages/ReviewModel/components';
import React from 'react';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import { ActiveModelContainer } from '../container/ActiveModelContainer';

const Container = styled.div`
  margin-top: 1rem;
`;

interface Props extends ModalProps {
  classifier: Classifier;
  onDeployClick: (classifier: Classifier) => void;
}

export const ReviewModelModal: React.FC<Props> = ({
  classifier,
  visible,
  toggleVisibility,
  onDeployClick,
}) => {
  return (
    <Modal
      title="Review model"
      okText="Deploy model"
      visible={visible}
      getContainer={getContainer}
      onCancel={() => toggleVisibility()}
      onOk={() => onDeployClick(classifier)}
    >
      <Container>
        <ActiveModelContainer classifier={classifier} fullWidth />
        <MatrixTable classifier={classifier} />
      </Container>
    </Modal>
  );
};
