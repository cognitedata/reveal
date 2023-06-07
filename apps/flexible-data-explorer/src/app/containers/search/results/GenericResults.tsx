import { useCallback, useMemo, useState } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import isEmpty from 'lodash/isEmpty';
import take from 'lodash/take';

import { Button } from '@cognite/cogs.js';

import { SearchResults } from '../../../components/search/SearchResults';
import { Table } from '../../../components/table/Table';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTypesDataModelQuery } from '../../../services/dataModels/query/useTypesDataModelQuery';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';

import { PAGE_SIZE } from './constants';

export const GenericResults: React.FC = () => {
  const { data: hits } = useSearchDataTypesQuery();
  const { data: types } = useTypesDataModelQuery();

  return (
    <>
      {Object.keys(hits || {}).map((dataType) => {
        const type = types?.find((item) => item.name === dataType);

        return (
          <GenericResultItem
            key={dataType}
            dataType={dataType}
            type={type}
            values={hits?.[dataType]}
          />
        );
      })}
    </>
  );
};

interface Props {
  dataType: string;
  values?: { items: any[] };
  type?: DataModelTypeDefsType;
}
const GenericResultItem: React.FC<Props> = ({ dataType, values, type }) => {
  const navigate = useNavigation();
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(PAGE_SIZE);

  const description = type?.description;
  const name = type?.name;

  const normalizedValues = useMemo(() => {
    return values?.items || EMPTY_ARRAY;
  }, [values?.items]);

  const columns = useMemo(() => {
    const fields = type?.fields || [];

    return fields.map((field) => ({
      header: field.name,
      accessorKey: field.id,
    }));
  }, [type?.fields]);

  const data = useMemo(() => {
    return take<any[]>(normalizedValues, page);
  }, [normalizedValues, page]);

  const handleRowClick = useCallback(
    (row: any) => {
      navigate.toInstancePage(dataType, row.space, row.externalId);
    },
    [navigate, dataType]
  );

  return (
    <SearchResults key={dataType} empty={isEmpty(normalizedValues)}>
      <SearchResults.Header
        title={name || dataType}
        description={description}
      />

      <SearchResults.Body>
        <Table
          id={`${dataType}-table`}
          data={data}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          type="ghost"
          onClick={() => {
            setPage((prevState) => prevState + PAGE_SIZE);
          }}
          disabled={normalizedValues.length <= page}
        >
          {t('show_more', 'Show more...')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
