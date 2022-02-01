import { Badge, Input } from '@cognite/cogs.js';
import { CogniteInternalId, FileInfo } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import useFileSearchQuery from 'hooks/useQuery/useFileSearchQuery';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';

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

  const assetQuery = useFileSearchQuery({
    filter: {
      assetIds: [assetId],
    },
    search: {
      name: query,
    },
    limit: 10,
  });
  const relatedQuery = useFileSearchQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
    search: {
      name: query,
    },
    limit: 10,
  });

  const renderSection = ({
    data,
    isLoading,
  }: UseQueryResult<FileInfo[], unknown>) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data) {
      return <NoData type="Documents" />;
    }
    if (groupByField) {
      return (
        <DocumentGrouper files={data} groupByField={groupByField}>
          {(documents) => (
            <DocumentRowWrapper>
              {documents.map((document, i) => (
                <DocumentRow key={document.id} document={document} />
              ))}
            </DocumentRowWrapper>
          )}
        </DocumentGrouper>
      );
    }
    return (
      <DocumentRowWrapper>
        {data.map((document, i) => (
          <DocumentRow key={document.id} document={document} />
        ))}
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
          On this asset <Badge text={String(assetQuery.data?.length || 0)} />
        </h3>
        {renderSection(assetQuery)}
      </section>
      <section>
        <h3>
          Related assets <Badge text={String(relatedQuery.data?.length || 0)} />
        </h3>
        {renderSection(relatedQuery)}
      </section>
    </DocumentTabWrapper>
  );
};

export default DocumentTab;
