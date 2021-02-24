import React from 'react';
import { Input, Col } from 'antd';
import DataSetSelect from 'components/DataSetSelect';
import { Icon, Colors } from '@cognite/cogs.js';
import { Filter } from 'modules/search';

type Props = {
  updateFilter?: (filter: Filter) => void;
  filter: Filter;
  dataSetsOnly?: boolean;
  onDataSetsUpdate?: (currentDataSets: { id: number }[]) => void;
  noTypeCheck?: boolean;
};
export default function EventSearchBar({
  filter,
  updateFilter = () => undefined,
  dataSetsOnly = false,
  onDataSetsUpdate,
  noTypeCheck = false,
}: Props) {
  const dataSetIds = (filter.filter?.dataSetIds || []).map((el: any) => el.id);
  return (
    <>
      <Col span={!dataSetsOnly ? 4 : 6}>
        <p>Data set</p>
        <DataSetSelect
          multiple
          noTypeCheck={noTypeCheck}
          style={{ width: '100%' }}
          selectedDataSetIds={dataSetIds}
          type="events"
          onDataSetSelected={(ids: number[]) => {
            const newDataSetIds =
              ids.length === 0 ? undefined : ids.map((id) => ({ id }));
            if (onDataSetsUpdate) {
              onDataSetsUpdate(newDataSetIds ?? []);
            } else {
              updateFilter({
                ...filter,
                filter: {
                  ...filter.filter,
                  dataSetIds: newDataSetIds,
                },
              });
            }
          }}
        />
      </Col>
      {!dataSetsOnly && (
        <Col span={4}>
          <p>Search</p>
          <Input
            disabled={dataSetsOnly}
            prefix={
              <Icon
                type="Search"
                style={{
                  height: '16px',
                  color: Colors['greyscale-grey6'].hex(),
                }}
              />
            }
            placeholder="Filter by description"
            value={filter.search ? filter.search.description : ''}
            onChange={(ev) =>
              updateFilter({
                ...filter,
                search:
                  ev.target.value.length > 0
                    ? {
                        ...filter.search,
                        description: ev.target.value,
                      }
                    : undefined,
              })
            }
          />
        </Col>
      )}
    </>
  );
}
