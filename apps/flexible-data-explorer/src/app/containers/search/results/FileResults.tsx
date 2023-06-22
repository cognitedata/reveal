import { formatDate, Skeleton } from '@cognite/cogs.js';

import { translationKeys } from '../../../common';
import { Button } from '../../../components/buttons/Button';
import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFilesSearchQuery } from '../../../services/instances/file/queries/useFilesSearchQuery';
import { buildFilesFilter } from '../../../utils/filterBuilder';

import { PAGE_SIZE } from './constants';

export const FileResults: React.FC = () => {
  const { t } = useTranslation();

  const [query] = useSearchQueryParams();
  const [filesFilterParams] = useDataTypeFilterParams('Files');
  const navigate = useNavigation();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useFilesSearchQuery(query, buildFilesFilter(filesFilterParams), PAGE_SIZE);

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  return (
    <SearchResults empty={data.length === 0}>
      <SearchResults.Header title="File" />

      <SearchResults.Body>
        {data.map(({ item }) => (
          <SearchResults.Item
            key={item.id}
            name={item.sourceFile.name}
            description={item.truncatedContent}
            // Sprinkle some AI magic to find the most relevant field here.
            properties={[
              {
                key: 'File type',
                value: item.type,
              },
              {
                key: 'Created Time',
                value: formatDate(item.createdTime),
              },
            ]}
            onClick={() => {
              navigate.toFilePage(item.externalId || item.id);
            }}
          />
        ))}
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          type="ghost"
          hidden={!hasNextPage}
          onClick={() => {
            fetchNextPage();
          }}
          loading={isFetchingNextPage}
        >
          {t(translationKeys.showMore, 'Show more')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
