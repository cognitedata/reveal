import { ExternalLabelDefinition } from '@cognite/sdk';
import { useLabelsCreateMutate } from 'src/services/query/labels/mutate';

import { TableWrapper } from 'src/components/table/TableWrapper';
import React from 'react';
import { useDocumentsUpdatePipelineMutate } from 'src/services/query/pipelines/mutate';
import ModalFooter from 'src/components/modal/ModalFooter';
import ModalHeader from 'src/components/modal/ModalHeader';
import {
  Labels,
  LabelsTable,
} from 'src/components/table/LabelsTable/LabelsTable';
import { ModalProps } from 'src/components/modal/types';
import { Modal } from 'src/components/modal/Modal';
import { CreateLabelModal } from './CreateLabelModal';

export const LabelsModal: React.FC<ModalProps> = ({
  visible,
  toggleVisibility,
}) => {
  const [showCreateLabelModal, setShowCreateLabelModal] = React.useState(false);
  const toggleLabelsModal = React.useCallback(() => {
    setShowCreateLabelModal((prevState) => !prevState);
  }, []);

  const { mutateAsync: createLabelAsync, isLoading } = useLabelsCreateMutate();

  const handleCreateLabelClick = (label: ExternalLabelDefinition) => {
    createLabelAsync(label).then(() => {
      toggleLabelsModal();
    });
  };

  const [selectedLabels, setSelectedLabels] = React.useState<Labels[]>([]);

  const { mutateAsync } = useDocumentsUpdatePipelineMutate('add');

  const handleLabelsClick = () => {
    const labels = selectedLabels.map(({ externalId }) => ({
      externalId,
    }));

    mutateAsync(labels)
      .then(() => {
        toggleVisibility();
      })
      .catch(() => null);
  };

  const handleSectionChange = React.useCallback((event: Labels[]) => {
    setSelectedLabels(event);
  }, []);

  return (
    <Modal
      title={
        <ModalHeader
          title="Add labels to classifier"
          buttonText="New label"
          buttonIcon="AddLarge"
          onButtonAction={() => toggleLabelsModal()}
        />
      }
      okText="Add labels"
      visible={visible}
      onCancel={() => toggleVisibility()}
      footer={
        <ModalFooter
          data={selectedLabels}
          label="labels"
          onOk={() => handleLabelsClick()}
          onCancel={() => toggleVisibility()}
        />
      }
    >
      <CreateLabelModal
        visible={showCreateLabelModal}
        toggleVisibility={toggleLabelsModal}
        onCreateClick={handleCreateLabelClick}
        isCreatingLabel={isLoading}
      />
      <TableWrapper stickyHeader>
        <LabelsTable onSelectionChange={handleSectionChange} />
      </TableWrapper>
    </Modal>
  );
};
