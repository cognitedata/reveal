import { translationKeys } from '../../../common';
import { Button } from '../../../components/buttons/Button';
import { SearchResults } from '../../../components/search/SearchResults';
import { Table } from '../../../components/table/Table';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFilesSearchQuery } from '../../../services/instances/file/queries/useFilesSearchQuery';
import { buildFilesFilter } from '../../../utils/filterBuilder';

import { PAGE_SIZE } from './constants';

const columns = [
  { header: 'Name', accessorKey: 'item.sourceFile.name' },
  { header: 'Content', accessorKey: 'item.truncatedContent' },
  { header: 'Type', accessorKey: 'item.type' },
];

export const FileResults: React.FC = () => {
  const { t } = useTranslation();

  const [query] = useSearchQueryParams();
  const [filesFilterParams] = useDataTypeFilterParams('Files');
  const navigate = useNavigation();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFilesSearchQuery(query, buildFilesFilter(filesFilterParams), PAGE_SIZE);

  return (
    <SearchResults empty={data.length === 0}>
      <SearchResults.Header title="Files" />

      <SearchResults.Body>
        <Table
          id="timeseries"
          data={data}
          columns={columns}
          onRowClick={(row) => {
            navigate.toFilePage(row.item.externalId || row.item.id);
          }}
        />
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          type="ghost"
          disabled={!hasNextPage}
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
