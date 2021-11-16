import { Classifier } from '@cognite/sdk-playground';
import { Modal } from 'components/Modal';
import { PageHeader } from 'components/page';
import { MatrixTable } from 'pages/Classifier/pages/ReviewModel/components';
import React from 'react';
import { getContainer } from 'utils/utils';
import { ClassifierTable } from '../table/ClassifierTable';

interface Props {
  classifier: Classifier;
  visible?: boolean;
  toggleVisibility: () => void;
}

export const ConfusionMatrixModal: React.FC<Props> = ({
  classifier,
  visible,
  toggleVisibility,
}) => {
  return (
    <Modal
      title="Confusion Matrix"
      okText="Deploy model"
      visible={visible}
      getContainer={getContainer}
      onCancel={() => toggleVisibility()}
      onOk={() => toggleVisibility()}
    >
      <PageHeader title="Classifier info" />
      <ClassifierTable classifier={classifier} />
      <PageHeader title="Confusion matrix" />
      <MatrixTable classifier={classifier} />
    </Modal>
  );
};
