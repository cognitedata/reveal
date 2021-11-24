import { Modal } from 'components/modal/Modal';
import { TableWrapper } from 'components/table/TableWrapper';
import React from 'react';
import { useDocumentsUpdatePipelineMutate } from 'services/query/pipelines/mutate';
import { getContainer } from 'utils/utils';
import ModalFooter from 'components/modal/ModalFooter';
import { Labels, LabelsTable } from '../table/LabelsTable';

interface Props {
  visible?: boolean;
  toggleVisibility: () => void;
}

export const LabelsModal: React.FC<Props> = ({ visible, toggleVisibility }) => {
  const [selectedLabels, setSelectedLabels] = React.useState<Labels[]>([]);

  const { mutateAsync } = useDocumentsUpdatePipelineMutate('add');

  const handleLabelsClick = () => {
    const labels = selectedLabels.map(({ externalId }) => ({
      externalId,
    }));

    mutateAsync(labels).then(() => {
      toggleVisibility();
    });
  };

  const handleSectionChange = React.useCallback((event: Labels[]) => {
    setSelectedLabels(event);
  }, []);

  return (
    <Modal
      title="Add labels to classifier"
      okText="Add labels"
      visible={visible}
      getContainer={getContainer}
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
