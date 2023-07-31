import * as React from 'react';
import { Input, Table } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import {
  DocumentSearchProvider,
  useDocumentSearch,
  useDocumentFilters,
  useDocumentAggregateCount,
  useDocumentFilteredAggregateCount,
} from '@cognite/react-document-search';
import { DocumentSearchItem } from '@cognite/sdk';
import debounce from 'lodash/debounce';

import { Container } from '../elements';

import { FileTypeFilter } from './components/Filters/actions/FileType';

const DocumentSearchWithProviders: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? (
        <DocumentSearchProvider sdkClient={client}>
          <DocumentSearch />
        </DocumentSearchProvider>
      ) : null
    }
  </AuthConsumer>
);

export const DocumentSearch: React.FC = () => {
  const { results } = useDocumentSearch();
  const { setAppliedFilters } = useDocumentFilters();
  const { data: totalCount, isLoading: isLoadingTotalCount } =
    useDocumentAggregateCount();
  const { data: filteredCount, isLoading: isLoadingFilteredCount } =
    useDocumentFilteredAggregateCount();
  const debouncedSearch = debounce((searchKey) => {
    setAppliedFilters({
      search: {
        query: searchKey,
      },
    });
  }, 300);

  return (
    <Container>
      {/* <Input value={phrase} onChange={(e) => setSearchPhrase(e.target.value)} /> */}
      <Input
        onChange={(event) => {
          debouncedSearch(event.target.value);
        }}
      />
      <FileTypeFilter onChange={() => null} />
      {/* <LabelFilter */}
      {/*  onChange={(value) => { */}
      {/*    setSearchFilters({ */}
      {/*      ...facets, */}
      {/*      labels: value.map((item) => ({ externalId: item })), */}
      {/*    }); */}
      {/*  }} */}
      {/* /> */}
      <p>Total documents: {isLoadingTotalCount ? 'Loading...' : totalCount}</p>
      <p>
        Total documents based on filter:{' '}
        {isLoadingFilteredCount ? 'Loading...' : filteredCount}
      </p>

      <p>Currently fetched: {results.length}</p>

      <Table<DocumentSearchItem>
        dataSource={results}
        columns={[
          {
            Header: 'Title',
            accessor: 'item.sourceFile.name',
            disableSortBy: true,
          },
          {
            Header: 'Path',
            accessor: 'item.sourceFile.directory',
          },
        ]}
        pagination={false}
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
