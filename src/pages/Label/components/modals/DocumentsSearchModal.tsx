import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Modal } from 'src/components/modal/Modal';
import { TableWrapper } from 'src/components/table/TableWrapper';
import React from 'react';
import { useDocumentsSearchQuery } from 'src/services/query/documents/query';
import { useUpdateFileLabelsMutate } from 'src/services/query/files/mutate';
import { getContainer } from 'src/utils/utils';
import ModalFooter from 'src/components/modal/ModalFooter';
import { ModalProps } from 'src/components/modal/types';
import { DocumentsTable } from '../table/DocumentsTable';

interface Props extends ModalProps {
  labelId: string;
}

export const DocumentsSearchModal: React.FC<Props> = React.memo(
  ({ visible, toggleVisibility, labelId }) => {
    const [selectedFiles, setSelectedFiles] = React.useState({});

    const { data, isLoading } = useDocumentsSearchQuery(visible);
    const { mutateAsync } = useUpdateFileLabelsMutate('add');

    const handleSelectedIds = (ids: { [x: number]: boolean }) => {
      setSelectedFiles(ids);
    };

    const fileIds = React.useMemo(() => {
      return Object.keys(selectedFiles).map((id) => Number(id));
    }, [selectedFiles]);

    const handleAddFilesClick = () => {
      if (fileIds.length > 0) {
        mutateAsync({ label: { externalId: labelId }, fileIds })
          .then(() => toggleVisibility())
          .catch(() => null);
      }
    };

    const renderTable = React.useMemo(
      () => (
        <DocumentsTable
          data={data}
          showFilters
          onSelectedIds={(ids) => handleSelectedIds(ids)}
        />
      ),
      [data]
    );

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
        footer={
          <ModalFooter
            data={fileIds}
            label="files"
            onOk={() => handleAddFilesClick()}
            onCancel={() => toggleVisibility()}
          />
        }
      >
        <TableWrapper stickyHeader>{renderTable}</TableWrapper>

        <ToastContainer />
      </Modal>
    );
  }
);
