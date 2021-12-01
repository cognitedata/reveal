import { TableWrapper } from 'components/table/TableWrapper';
import React from 'react';
import { useDocumentsUpdatePipelineMutate } from 'services/query/pipelines/mutate';
import ModalFooter from 'components/modal/ModalFooter';
import { Labels, LabelsTable } from 'components/table/LabelsTable/LabelsTable';
import { ModalProps } from 'components/modal/types';
import { Modal } from 'components/modal/Modal';

export const LabelsModal: React.FC<ModalProps> = ({
  visible,
  toggleVisibility,
}) => {
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
      title="Add labels to classifier"
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
      <TableWrapper stickyHeader>
        <LabelsTable onSelectionChange={handleSectionChange} />
      </TableWrapper>
    </Modal>
  );
};
