import { useState } from 'react';

import take from 'lodash/take';

import { Button } from '@cognite/cogs.js';

import { SearchResults } from '../../../components/search/SearchResults';
import { Table } from '../../../components/table/Table';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTypesDataModelQuery } from '../../../services/dataModels/query/useTypesDataModelQuery';

import { PAGE_SIZE } from './constants';

interface Props {
  data?: Record<string, any>;
}

export const GenericResults: React.FC<Props> = ({ data }) => {
  const navigate = useNavigation();

  const { data: types } = useTypesDataModelQuery();

  const [page, setPage] = useState<Record<string, number>>({});

  return (
    <>
      {Object.keys(data || {}).map((key) => {
        const values = data?.[key];

        const type = types?.find((item) => item.name === key);

        const fields = type?.fields || [];
        const description = type?.description;
        const name = type?.name;

        const columns = fields.map((field) => ({
          header: field.name,
          accessorKey: field.id,
        }));

        return (
          <SearchResults key={key} empty={values.items.length === 0}>
            <SearchResults.Header
              title={name || key}
              description={description}
            />

            <SearchResults.Body>
              <Table
                id={`${key}-table`}
                // Optimize this part in the near future!
                data={take<any[]>(values.items, page[key] || PAGE_SIZE)}
                columns={columns}
                onRowClick={(row: any) => {
                  navigate.toInstancePage(key, row.space, row.externalId);
                }}
              />
            </SearchResults.Body>

            <SearchResults.Footer>
              <Button
                type="ghost"
                onClick={() => {
                  setPage((prevState) => ({
                    ...prevState,
                    [key]: (prevState[key] || PAGE_SIZE) + PAGE_SIZE,
                  }));
                }}
                disabled={values.items.length <= (page[key] || PAGE_SIZE)}
              >
                Show more...
              </Button>
            </SearchResults.Footer>
          </SearchResults>
        );
      })}
    </>
  );
};
