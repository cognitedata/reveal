import { useCallback, useMemo, useState } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import isEmpty from 'lodash/isEmpty';
import take from 'lodash/take';

import { Button, Skeleton } from '@cognite/cogs.js';

import { translationKeys } from '../../../common/i18n/translationKeys';
import { SearchResults } from '../../../components/search/SearchResults';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTypesDataModelQuery } from '../../../services/dataModels/query/useTypesDataModelQuery';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';

import { PAGE_SIZE } from './constants';

export const GenericResults: React.FC<{ selectedDataType?: string }> = ({
  selectedDataType,
}) => {
  const { data: hits, isLoading } = useSearchDataTypesQuery();
  const { data: types } = useTypesDataModelQuery();

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  if (selectedDataType) {
    const type = types?.find((item) => item.name === selectedDataType);

    return (
      <GenericResultItem
        dataType={selectedDataType}
        type={type}
        values={hits?.[selectedDataType]}
      />
    );
  }

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

  const data = useMemo(() => {
    return take<any>(normalizedValues, page);
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
        {data.map((item) => {
          // TODO: Move this into separate component and refactor the code while doing so!
          const properties = (type?.fields || []).reduce((acc, field) => {
            if (
              field.name === 'externalId' ||
              field.name === 'name' ||
              field.name === 'description'
            ) {
              return acc;
            }

            if (item[field.name] === undefined || item[field.name] === null) {
              return acc;
            }

            return [...acc, { key: field.name, value: item[field.name] }];
          }, [] as { key: string; value: string }[]);

          return (
            <SearchResults.Item
              key={item.externalId}
              name={item.name}
              description={item.description}
              properties={properties}
              onClick={() => handleRowClick(item)}
            />
          );
        })}
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          onClick={() => {
            setPage((prevState) => prevState + PAGE_SIZE);
          }}
          type="secondary"
          hidden={normalizedValues.length <= page}
        >
          {t(translationKeys.showMore, 'Show more...')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
