import React from 'react';

import { Modal } from '@cognite/cogs.js';
import { ExternalLabelDefinition } from '@cognite/sdk';

import {
  Labels,
  LabelsTable,
} from '../../../../../../components/table/LabelsTable/LabelsTable';
import { TableWrapper } from '../../../../../../components/table/TableWrapper';
import { useLabelsCreateMutate } from '../../../../../../services/query/labels/mutate';
import { useDocumentsUpdatePipelineMutate } from '../../../../../../services/query/pipelines/mutate';

import { CreateLabelModal } from './CreateLabelModal';

export const LabelsModal = ({
  visible,
  toggleVisibility,
}: {
  visible?: boolean;
  toggleVisibility: () => void;
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
      size="full-screen"
      title="Add labels to classifier"
      okText="Add labels"
      okDisabled={selectedLabels.length === 0}
      visible={visible}
      onOk={handleLabelsClick}
      onCancel={toggleVisibility}
      additionalActions={[
        { children: 'New Label', icon: 'AddLarge', onClick: toggleLabelsModal },
      ]}
    >
      <TableWrapper stickyHeader>
        <LabelsTable onSelectionChange={handleSectionChange} />
      </TableWrapper>
      <CreateLabelModal
        visible={showCreateLabelModal}
        toggleVisibility={toggleLabelsModal}
        onCreateClick={handleCreateLabelClick}
        isCreatingLabel={isLoading}
      />
    </Modal>
  );
};
