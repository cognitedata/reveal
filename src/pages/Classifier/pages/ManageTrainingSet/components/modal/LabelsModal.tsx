import { Modal } from 'components/Modal';
import React from 'react';
import { useDocumentsUpdatePipelineMutate } from 'services/query/documents/mutate';
import { StickyTableHeadContainer } from 'styles/elements';
import { getContainer } from 'utils/utils';
import { Labels, LabelsTable } from '../table/LabelsTable';

interface Props {
  visible?: boolean;
  toggleVisibility: () => void;
}

export const LabelsModal: React.FC<Props> = ({ visible, toggleVisibility }) => {
  const selectedLabels = React.useRef<Labels[]>([]);

  const { mutateAsync } = useDocumentsUpdatePipelineMutate('add');

  const handleLabelsClick = () => {
    const labels = selectedLabels.current.map(({ externalId }) => ({
      externalId,
    }));

    mutateAsync(labels).then(() => {
      toggleVisibility();
    });
  };

  const handleSectionChange = React.useCallback((event: Labels[]) => {
    selectedLabels.current = event;
  }, []);

  return (
    <Modal
      title="Add labels to classifier"
      okText="Add labels"
      visible={visible}
      getContainer={getContainer}
      onCancel={() => toggleVisibility()}
      onOk={() => handleLabelsClick()}
    >
      <StickyTableHeadContainer>
        <LabelsTable onSelectionChange={handleSectionChange} />
      </StickyTableHeadContainer>
    </Modal>
  );
};
