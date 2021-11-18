import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Modal } from 'components/Modal';
import React from 'react';
import { useDocumentsSearchQuery } from 'services/query/documents/query';
import { useUpdateFileLabelsMutate } from 'services/query/files/mutate';
import { StickyTableHeadContainer } from 'styles/elements';
import { getContainer } from 'utils/utils';
import { DocumentsTable } from '../table/DocumentsTable';

interface Props {
  labelId: string;
  visible?: boolean;
  toggleVisibility: () => void;
}
export const DocumentsSearchModal: React.FC<Props> = React.memo(
  ({ visible, toggleVisibility, labelId }) => {
    const selectedIds = React.useRef({});
    const { data, isLoading } = useDocumentsSearchQuery(visible);
    const { mutateAsync } = useUpdateFileLabelsMutate('add');

    const handleSelectedIds = (ids: { [x: number]: boolean }) => {
      selectedIds.current = ids;
    };

    const handleAddFilesClick = () => {
      const documentIds = Object.keys(selectedIds.current).map((id) =>
        Number(id)
      );

      if (documentIds.length > 0) {
        mutateAsync({ label: { externalId: labelId }, documentIds }).then(() =>
          toggleVisibility()
        );
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
        appElement={getContainer()}
        onCancel={() => toggleVisibility()}
        onOk={() => handleAddFilesClick()}
      >
        <StickyTableHeadContainer>
          <DocumentsTable
            data={data}
            showFilters
            onSelectedIds={(ids) => handleSelectedIds(ids)}
          />
        </StickyTableHeadContainer>

        <ToastContainer />
      </Modal>
    );
  }
);
