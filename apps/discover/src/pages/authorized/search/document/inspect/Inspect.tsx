import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { UseTableRowProps } from 'react-table';

import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import { DeleteButton } from 'components/buttons';
import Header from 'components/header/Header';
import { Table, Options } from 'components/tablev2';
import navigation from 'constants/navigation';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { usePreviewedDocuments } from 'modules/documentSearch/selectors';
import { DocumentType } from 'modules/documentSearch/types';
import { FlexColumn } from 'styles/layout';

import { Header as InspectHeader } from '../../common/inspect/Header';

import {
  ACTIONS,
  AUTHOR,
  CREATED,
  DOCUMENT_INSPECT,
  FILE_SIZE,
  MODIFIED,
  PATH,
  REMOVE_FROM_INSPECTED,
  SOURCE,
  TITLE,
  TOP_FOLDER,
} from './constants';
import { DownloadInspected } from './DownloadInspected';

const InspectPanelWrapper = styled(FlexColumn)`
  height: 100%;
`;

interface ActionProps {
  doc: DocumentType;
}
const Actions: React.FC<ActionProps> = ({ doc }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(documentSearchActions.removeFromPreviewedEntity(doc));
  };

  return (
    <DeleteButton
      tooltip={t(REMOVE_FROM_INSPECTED)}
      onClick={handleDelete}
      data-testid="document-inspect-delete"
    />
  );
};

export const DocInspect: React.FC = () => {
  const data = usePreviewedDocuments();
  const history = useHistory();

  const handleBackToSearch = () => history.push(navigation.SEARCH);

  React.useEffect(() => {
    /**
     * This will redirect the app to document search screen if there are no selected documents.
     * This Usable when user directly access the inspection screen
     */
    if (data.length === 0) {
      handleBackToSearch();
    }
  }, [data]);

  const { t } = useTranslation();

  const Cell: React.FC = ({ children }) => <Body level={2}>{children}</Body>;

  const columns = React.useMemo(
    () => [
      {
        Header: t(TITLE),
        accessor: 'doc.title',
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.title || row.original.doc.filename}</Cell>
        ),
      },
      {
        Header: t(PATH),
        accessor: 'doc.filepath',
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.filepath}</Cell>
        ),
      },
      {
        Header: t(AUTHOR),
        accessor: 'doc.author',
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.author}</Cell>
        ),
      },
      {
        Header: t(TOP_FOLDER),
        accessor: 'doc.topfolder',
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.topfolder}</Cell>
        ),
      },
      {
        Header: t(SOURCE),
        accessor: 'doc.location',
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.location}</Cell>
        ),
      },
      {
        Header: t(FILE_SIZE),
        accessor: 'doc.filesize',
        maxWidth: 100,
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.filesize}</Cell>
        ),
      },
      {
        Header: t(MODIFIED),
        accessor: 'doc.lastmodified',
        maxWidth: 100,
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.lastmodified}</Cell>
        ),
      },
      {
        Header: t(CREATED),
        accessor: 'doc.creationdate',
        maxWidth: 100,
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Cell>{row.original.doc.creationdate}</Cell>
        ),
      },
      {
        Header: t(ACTIONS),
        Cell: ({ row }: { row: UseTableRowProps<DocumentType> }) => (
          <Actions doc={row.original} />
        ),
      },
    ],
    []
  );

  const hasData = data.length > 0;
  const options: Options = { flex: false, height: '100%' };

  return (
    <>
      <InspectHeader handleBackToSearch={handleBackToSearch} />
      <InspectPanelWrapper>
        <Header title={t(DOCUMENT_INSPECT)} />
        {hasData && <DownloadInspected data={data} />}
        {hasData && (
          <Table<DocumentType>
            scrollTable
            id="inspect-documents"
            data={data}
            columns={columns}
            options={options}
          />
        )}
      </InspectPanelWrapper>
    </>
  );
};

export default DocInspect;
