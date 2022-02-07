import { Badge, Input } from '@cognite/cogs.js';
import { CogniteInternalId, FileInfo } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import useFileSearchQuery from 'hooks/useQuery/useFileSearchQuery';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import usePagination from 'hooks/usePagination';
import useFileAggregateQuery from 'hooks/useQuery/useFileAggregateQuery';

import DocumentGrouper from '../DocumentGrouper';
import DocumentRow from '../DocumentRow';
import { DocumentRowWrapper } from '../DocumentRow/DocumentRowWrapper';

import { DocumentTabWrapper } from './elements';

export type DocumentTabProps = {
  // current version of @cognite/sdk v5.6.2 doesn't support parameter assetExternalIds
  // in FilesSearchFilter. So we can only use CogniteInternalId here
  assetId: CogniteInternalId;
  groupByField?: string;
};

const DocumentTab = ({ assetId, groupByField = '' }: DocumentTabProps) => {
  // The actual value of the input field
  const [value, setValue] = useState('');
  // The field we pass to the query (so we can debounce)
  const [query, setQuery] = useState('');
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);
  const { renderPagination, getPageData, resetPages } = usePagination();

  const { data: totalFilesOnAsset } = useFileAggregateQuery({
    filter: {
      assetIds: [assetId],
    },
  });
  const { data: totalFilesUnderAsset } = useFileAggregateQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
  });
  const assetQuery = useFileSearchQuery({
    filter: {
      assetIds: [assetId],
    },
    search: {
      name: query,
    },
    limit: 500,
  });

  const relatedQuery = useFileSearchQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
    search: {
      name: query,
    },
    limit: 500,
  });

  useEffect(() => {
    resetPages();
  }, [relatedQuery.data, assetQuery.data]);

  const renderSection = (
    { data, isLoading }: UseQueryResult<FileInfo[], unknown>,
    paginationName: string
  ) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data || data.length === 0) {
      return <NoData type="Documents" />;
    }
    if (groupByField) {
      return (
        <DocumentGrouper files={data} groupByField={groupByField}>
          {(documents, type) => (
            <DocumentRowWrapper>
              {getPageData(documents, `${paginationName}-${type}`).map(
                (document, i) => (
                  <DocumentRow key={document.id} document={document} />
                )
              )}
              {renderPagination({
                name: `${paginationName}-${type}`,
                total: data.length,
              })}
            </DocumentRowWrapper>
          )}
        </DocumentGrouper>
      );
    }

    return (
      <DocumentRowWrapper>
        {getPageData(data, paginationName).map((document) => (
          <DocumentRow key={document.id} document={document} />
        ))}
        {renderPagination({
          name: paginationName,
          total: data.length,
        })}
      </DocumentRowWrapper>
    );
  };
  return (
    <DocumentTabWrapper>
      <Input
        className="search-input"
        placeholder="Search"
        icon="Search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSetQuery(e.target.value);
        }}
      />
      <section>
        <h3>
          On this asset{' '}
          <Badge
            text={String(
              (query ? assetQuery.data?.length : totalFilesOnAsset) || 0
            )}
          />
        </h3>
        {renderSection(assetQuery, 'thisAsset')}
      </section>
      <section>
        <h3>
          Related documents{' '}
          <Badge
            text={String(
              (query ? relatedQuery.data?.length : totalFilesUnderAsset) || 0
            )}
          />
        </h3>
        {renderSection(relatedQuery, 'relatedAssets')}
      </section>
    </DocumentTabWrapper>
  );
};

export default DocumentTab;
