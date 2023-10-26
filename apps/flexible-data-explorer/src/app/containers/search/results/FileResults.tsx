import { formatDate, Skeleton } from '@cognite/cogs.js';

import { Button } from '../../../components/buttons/Button';
import { EmptyState } from '../../../components/EmptyState';
import { Link } from '../../../components/Link';
import { SearchResults } from '../../../components/search/SearchResults';
import { useSearchFilterParams } from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFilesSearchQuery } from '../../../services/instances/file/queries/useFilesSearchQuery';
import { InstancePreview } from '../../preview/InstancePreview';
import { RelationshipFilter } from '../../widgets/RelationshipEdges/Filters';

import { PAGE_SIZE, PAGE_SIZE_SELECTED } from './constants';

interface Props {
  selected?: boolean;
}
export const FileResults: React.FC<Props> = ({ selected }) => {
  const { t } = useTranslation();

  const [filters, setFilters] = useSearchFilterParams();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useFilesSearchQuery(selected ? PAGE_SIZE_SELECTED : PAGE_SIZE);

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  return (
    <SearchResults data-testid="file-results">
      <SearchResults.Header title="Files">
        <RelationshipFilter
          dataType="Files"
          value={filters?.['Files']}
          onChange={(value, action) => {
            const nextFilters = {
              ...filters,
              Files: value,
            };

            setFilters(nextFilters, action === 'add' ? 'File' : undefined);
          }}
        />
      </SearchResults.Header>

      <SearchResults.Body>
        {data.length === 0 && (
          <EmptyState
            title={t('SEARCH_RESULTS_EMPTY_TITLE')}
            body={t('SEARCH_RESULTS_EMPTY_BODY')}
          />
        )}

        {data.map(({ item }) => (
          <InstancePreview.File key={item.id} id={item.id}>
            <Link.FilePage externalId={item.externalId}>
              <SearchResults.Item
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
              />
            </Link.FilePage>
          </InstancePreview.File>
        ))}
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          type="secondary"
          hidden={!hasNextPage}
          onClick={() => {
            fetchNextPage();
          }}
          loading={isFetchingNextPage}
        >
          {t('GENERAL_SHOW_MORE')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
