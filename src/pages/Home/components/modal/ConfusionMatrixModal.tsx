import { Classifier } from '@cognite/sdk-playground';
import { Modal } from 'components/modal/Modal';
import { PageHeader } from 'components/page';
import { MatrixTable } from 'pages/Classifier/pages/ReviewModel/components';
import React from 'react';
import { getContainer } from 'utils/utils';
import { ActiveModelContainer } from '../container/ActiveModelContainer';

interface Props {
  classifier: Classifier;
  visible?: boolean;
  toggleVisibility: () => void;
  onDeployClick: (classifier: Classifier) => void;
}

export const ConfusionMatrixModal: React.FC<Props> = ({
  classifier,
  visible,
  toggleVisibility,
  onDeployClick,
}) => {
  return (
    <Modal
      title="Confusion Matrix"
      okText="Deploy model"
      visible={visible}
      getContainer={getContainer}
      onCancel={() => toggleVisibility()}
      onOk={() => onDeployClick(classifier)}
    >
      <br />
      <ActiveModelContainer classifier={classifier} />
      <PageHeader title="Confusion matrix" titleLevel={5} />
      <MatrixTable classifier={classifier} />
    </Modal>
  );
};
