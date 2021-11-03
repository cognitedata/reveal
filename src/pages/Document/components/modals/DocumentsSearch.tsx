import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Modal } from 'components/Modal';
import React from 'react';
import { useDocumentsSearchQuery } from 'services/query/documents/query';
import { useUpdateFileLabelsMutate } from 'services/query/files/mutate';
import { DocumentsTable } from '../Table/DocumentsTable';

interface Props {
  labelId: string;
  visible?: boolean;
  toggleVisibility: () => void;
}
export const DocumentsSearchModal: React.FC<Props> = React.memo(
  ({ visible, toggleVisibility, labelId }) => {
    const selectedIds = React.useRef({});
    const { data, isLoading } = useDocumentsSearchQuery(visible);
    const { mutate } = useUpdateFileLabelsMutate('add');

    const handleSelectedIds = (ids: { [x: number]: boolean }) => {
      selectedIds.current = ids;
    };

    const handleAddFilesClick = () => {
      const documentIds = Object.keys(selectedIds.current).map((id) =>
        Number(id)
      );

      if (documentIds.length > 0) {
        mutate({ label: { externalId: labelId }, documentIds });
      }
    };

    if (isLoading) {
      return <Loader />;
    }

    return (
      <Modal
        title="Add new files"
        okText="Add files"
        visible={visible}
        onCancel={() => toggleVisibility()}
        onOk={() => handleAddFilesClick()}
      >
        <DocumentsTable
          data={data}
          showFilters
          onSelectedIds={(ids) => handleSelectedIds(ids)}
        />
        <ToastContainer />
      </Modal>
    );
  }
);
