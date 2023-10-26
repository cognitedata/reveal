import { useMemo, useState } from 'react';

import { isArray, isObject } from 'lodash';
import take from 'lodash/take';

import { Button } from '../../../components/buttons/Button';
import { EmptyState } from '../../../components/EmptyState';
import { Link } from '../../../components/Link';
import { SearchResults } from '../../../components/search/SearchResults';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useSearchFilterParams } from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFDM } from '../../../providers/FDMProvider';
import { DataModelTypeDefsType, Instance } from '../../../services/types';
import { InstancePreview } from '../../preview/InstancePreview';
import { RelationshipFilter } from '../../widgets/RelationshipEdges/Filters';

import { PAGE_SIZE, PAGE_SIZE_SELECTED } from './constants';

interface Props {
  dataType: string;
  selectedExternalId?: string;
  values?: { items: any[] };
  type?: DataModelTypeDefsType;
  selected?: boolean;
  disable3dPreview?: boolean;
  onItemHover?: (item: any) => void;
  renderHoverButton?: (selectedInstance: Instance) => React.ReactNode;
}
export const GenericResults: React.FC<Props> = ({
  dataType,
  values,
  type,
  selected,
  selectedExternalId,
  disable3dPreview,
  renderHoverButton,
}) => {
  const { t } = useTranslation();
  const client = useFDM();
  const dataModel = client.getDataModelByDataType(dataType);

  const [filters, setFilters] = useSearchFilterParams();

  const pageSize = selected ? PAGE_SIZE_SELECTED : PAGE_SIZE;
  const [page, setPage] = useState<number>(pageSize);

  const normalizedValues = useMemo(() => {
    return values?.items || EMPTY_ARRAY;
  }, [values?.items]);

  const data = useMemo(() => {
    return take<any>(normalizedValues, page);
  }, [normalizedValues, page]);

  return (
    <SearchResults key={dataType} data-testid={`generic-results-${dataType}`}>
      <SearchResults.Header
        title={type?.displayName || type?.name || dataType}
        description={type?.description}
      >
        <RelationshipFilter
          dataType={dataType}
          value={filters?.[dataType]}
          onChange={(value, action) => {
            const nextFilters = {
              ...filters,
              [dataType]: value,
            };

            setFilters(nextFilters, action === 'add' ? dataType : undefined);
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

          const instance = {
            dataType,
            instanceSpace: item.space,
            externalId: item.externalId,
          };

          return (
            <InstancePreview.Generic
              key={item.externalId}
              dataModel={dataModel}
              instance={instance}
              disableViewer={disable3dPreview}
            >
              <Link.GenericPage instance={instance} dataModel={dataModel}>
                <SearchResults.Item
                  name={item.name ?? item.externalId}
                  description={item.description}
                  properties={properties}
                  selected={item.externalId === selectedExternalId}
                  customHoverButton={renderHoverButton?.({
                    externalId: item.externalId,
                    instanceSpace: item.space,
                    dataType,
                  })}
                />
              </Link.GenericPage>
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
