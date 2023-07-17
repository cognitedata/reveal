import { useCallback, useMemo, useState } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { isArray, isObject } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import take from 'lodash/take';

import { Button, Skeleton } from '@cognite/cogs.js';

import { SearchResults } from '../../../components/search/SearchResults';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFDM } from '../../../providers/FDMProvider';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';

import { PAGE_SIZE } from './constants';

export const GenericResults: React.FC<{ selectedDataType?: string }> = ({
  selectedDataType,
}) => {
  const client = useFDM();
  const { data: hits, isLoading } = useSearchDataTypesQuery();

  if (isLoading) {
    return <Skeleton.List lines={3} />;
  }

  if (selectedDataType) {
    const type = client.allDataTypes?.find(
      (item) => item.name === selectedDataType
    );
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
        const type = client.allDataTypes?.find(
          (item) => item.name === dataType
        );

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
  const client = useFDM();

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
      const dataModel = client.getDataModelByDataType(dataType);
      navigate.toInstancePage(dataType, row.space, row.externalId, {
        dataModel: dataModel?.externalId,
        space: dataModel?.space,
        version: dataModel?.version,
      });
    },
    [navigate, dataType, client]
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

            const value = item[field.name];

            if (value === undefined || value === null) {
              return acc;
            }

            if (isObject(value) || isArray(value)) {
              return acc;
            }

            return [...acc, { key: field.name, value: value }];
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
          {t('GENERAL_SHOW_MORE')}
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
