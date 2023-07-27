import { formatDate, Skeleton } from '@cognite/cogs.js';

import { Button } from '../../../components/buttons/Button';
import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFilesSearchQuery } from '../../../services/instances/file/queries/useFilesSearchQuery';
import { InstancePreview } from '../../preview/InstancePreview';

import { PAGE_SIZE } from './constants';

export const FileResults: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigation();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } =
    useFilesSearchQuery(PAGE_SIZE);

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  return (
    <SearchResults empty={data.length === 0}>
      <SearchResults.Header title="File" />

      <SearchResults.Body>
        {data.map(({ item }) => (
          <InstancePreview.File key={item.id} id={item.id}>
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
              onClick={() => {
                navigate.toFilePage(item.externalId || item.id);
              }}
            />
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
