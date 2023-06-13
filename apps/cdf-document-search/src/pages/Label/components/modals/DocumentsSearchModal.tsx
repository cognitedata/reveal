import React from 'react';

import { Loader, ToastContainer, Modal } from '@cognite/cogs.js';

import { TableWrapper } from '../../../../components/table/TableWrapper';
import { useDocumentsSearchQuery } from '../../../../services/query/documents/query';
import { useUpdateFileLabelsMutate } from '../../../../services/query/files/mutate';
import { DocumentsTable } from '../table/DocumentsTable';

export const DocumentsSearchModal = React.memo(
  ({
    labelId,
    visible,
    toggleVisibility,
  }: {
    labelId: string;

    visible?: boolean;
    toggleVisibility: () => void;
  }) => {
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
        size="full-screen"
        title="Add new files"
        okText="Add files"
        okDisabled={fileIds.length === 0}
        visible={visible}
        onOk={handleAddFilesClick}
        onCancel={toggleVisibility}
      >
        <TableWrapper stickyHeader>{renderTable}</TableWrapper>
        <ToastContainer />
      </Modal>
    );
  }
);
