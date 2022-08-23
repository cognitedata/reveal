import * as React from 'react';
import { Table } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import {
  DocumentSearchProvider,
  useDocumentSearchDispatch,
  useDocumentSearchQuery,
  useDocumentSearchState,
  SearchInput,
  DocumentResult,
} from '@cognite/react-document-search';

import { Container } from '../elements';

import { FileTypeFilter } from './components/Filters/actions/FileType';
import { LabelFilter } from './components/Filters/actions/Label';

const DocumentSearchWithProviders: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? (
        <DocumentSearchProvider cogniteClient={client}>
          <DocumentSearch />
        </DocumentSearchProvider>
      ) : null
    }
  </AuthConsumer>
);

export const DocumentSearch: React.FC = () => {
  const { facets } = useDocumentSearchState();
  const { setSearchFilters } = useDocumentSearchDispatch();

  const { results } = useDocumentSearchQuery();

  return (
    <Container>
      {/* <Input value={phrase} onChange={(e) => setSearchPhrase(e.target.value)} /> */}
      <SearchInput />
      <FileTypeFilter onChange={() => null} />
      <LabelFilter
        onChange={(value) => {
          setSearchFilters({
            ...facets,
            labels: value.map((item) => ({ externalId: item })),
          });
        }}
      />
      <Table<DocumentResult['hits']>
        dataSource={results.hits}
        columns={[
          {
            Header: 'Title',
            accessor: 'sourceFile.name',
            disableSortBy: true,
          },
          {
            Header: 'Path',
            accessor: 'sourceFile.directory',
          },
        ]}
        pagination={false}
        // onRow={() => ({
        //   onClick: action('onClick'),
        // })}
        resizable
        blockLayout={{
          minWidth: 100,
          width: 200,
          maxWidth: 400,
        }}
      />
    </Container>
  );
};

export default DocumentSearchWithProviders;
