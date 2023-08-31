import { useCallback, useMemo, useState } from 'react';

import { isArray, isObject } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import take from 'lodash/take';

import { Button } from '../../../components/buttons/Button';
import { EmptyState } from '../../../components/EmptyState';
import { SearchResults } from '../../../components/search/SearchResults';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFDM } from '../../../providers/FDMProvider';
import { DataModelTypeDefsType } from '../../../services/types';
import { InstancePreview } from '../../preview/InstancePreview';

import { PAGE_SIZE, PAGE_SIZE_SELECTED } from './constants';

interface Props {
  dataType: string;
  values?: { items: any[] };
  type?: DataModelTypeDefsType;
  selected?: boolean;
}
export const GenericResults: React.FC<Props> = ({
  dataType,
  values,
  type,
  selected,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigation();
  const client = useFDM();
  const dataModel = client.getDataModelByDataType(dataType);

  const pageSize = selected ? PAGE_SIZE_SELECTED : PAGE_SIZE;
  const [page, setPage] = useState<number>(pageSize);

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

  if (selected && data.length === 0) {
    return (
      <EmptyState
        title={t('SEARCH_RESULTS_EMPTY_TITLE')}
        body={t('SEARCH_RESULTS_EMPTY_BODY')}
      />
    );
  }

  return (
    <SearchResults key={dataType} empty={isEmpty(normalizedValues)}>
      <SearchResults.Header
        title={type?.displayName || type?.name || dataType}
        description={type?.description}
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
            setPage((prevState) => prevState + pageSize);
          }}
          hidden={normalizedValues.length <= page}
        />
      </SearchResults.Footer>
    </SearchResults>
  );
};
