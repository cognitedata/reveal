import { useCallback, useMemo, useState } from 'react';

import { isArray, isObject } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import take from 'lodash/take';

import { Skeleton } from '@cognite/cogs.js';

import { Button } from '../../../components/buttons/Button';
import { SearchResults } from '../../../components/search/SearchResults';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useNavigation } from '../../../hooks/useNavigation';
import { useFDM } from '../../../providers/FDMProvider';
import { useSearchDataTypesQuery } from '../../../services/dataTypes/queries/useSearchDataTypesQuery';
import { DataModelTypeDefsType } from '../../../services/types';
import { InstancePreview } from '../../preview/InstancePreview';

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
  const client = useFDM();
  const dataModel = client.getDataModelByDataType(dataType);

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
      navigate.toInstancePage(dataType, row.space, row.externalId, {
        dataModel: dataModel?.externalId,
        space: dataModel?.space,
        version: dataModel?.version,
      });
    },
    [navigate, dataType, dataModel]
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

            return [
              ...acc,
              { key: field.displayName || field.name, value: value },
            ];
          }, [] as { key: string; value: string }[]);

          return (
            <InstancePreview.Generic
              key={item.externalId}
              dataModel={dataModel}
              instance={{
                dataType,
                instanceSpace: item.space,
                externalId: item.externalId,
              }}
            >
              <SearchResults.Item
                name={item.name || item.externalId}
                description={item.description}
                properties={properties}
                onClick={() => handleRowClick(item)}
              />
            </InstancePreview.Generic>
          );
        })}
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button.ShowMore
          onClick={() => {
            setPage((prevState) => prevState + PAGE_SIZE);
          }}
          hidden={normalizedValues.length <= page}
        />
      </SearchResults.Footer>
    </SearchResults>
  );
};
