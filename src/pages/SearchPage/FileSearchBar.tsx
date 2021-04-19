import React from 'react';
import { Input, Col, Select } from 'antd';
import { Filter } from 'modules/sdk-builder/types';
import DataSetSelect from 'components/DataSetSelect';
import { Icon, Colors } from '@cognite/cogs.js';
import omit from 'lodash/omit';

type Props = {
  updateFilter?: (filter: Filter) => void;
  filter?: Filter;
  lockedFilters?: Filter;
  dataSetsOnly?: boolean;
  noTypeCheck?: boolean;
  onDataSetsUpdate?: (currentDataSets: { id: number }[]) => void;
};
export default function FileSearchBar({
  filter = {},
  lockedFilters,
  updateFilter = () => undefined,
  dataSetsOnly = false,
  noTypeCheck = false,
  onDataSetsUpdate,
}: Props) {
  const selectedDataSetIds = (filter.filter.dataSetIds || []).map(
    (e: any) => e?.id
  );

  const onTypeChange = (newMimeType: string) => {
    if (newMimeType === 'all') {
      const newFilter = omit(filter.filter, ['mimeType']);
      updateFilter({
        ...filter,
        filter: newFilter,
      });
    } else {
      updateFilter({
        ...filter,
        filter: {
          ...filter.filter,
          mimeType: newMimeType,
        },
      });
    }
  };

  return (
    <>
      <Col span={!dataSetsOnly ? 4 : 6}>
        <p>Data set</p>
        <DataSetSelect
          multiple
          noTypeCheck={noTypeCheck}
          style={{ width: '100%' }}
          selectedDataSetIds={selectedDataSetIds}
          resourceType="files"
          onDataSetSelected={(ids: number[]) => {
            const dataSetIds =
              ids.length === 0 ? undefined : ids.map((id) => ({ id }));
            if (onDataSetsUpdate) {
              onDataSetsUpdate(dataSetIds ?? []);
            } else {
              updateFilter({
                ...filter,
                filter: {
                  ...filter.filter,
                  dataSetIds,
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
            id="search"
            prefix={
              <Icon
                type="Search"
                style={{
                  height: '16px',
                  color: Colors['greyscale-grey6'].hex(),
                }}
              />
            }
            placeholder="Filter by name"
            value={filter.search ? filter.search.name : ''}
            onChange={(ev) =>
              updateFilter({
                ...filter,
                search:
                  ev.target.value.length > 0
                    ? {
                        ...filter.search,
                        name: ev.target.value,
                      }
                    : undefined,
              })
            }
          />
        </Col>
      )}
      {!dataSetsOnly && (
        <Col span={4}>
          <p>Source</p>
          <Input
            disabled={dataSetsOnly}
            id="source"
            placeholder="Filter by source"
            value={filter.filter ? filter.filter.source : undefined}
            onChange={(ev) =>
              updateFilter({
                ...filter,
                filter: {
                  ...filter.filter,
                  source:
                    ev.target.value.length > 0 ? ev.target.value : undefined,
                },
              })
            }
          />
        </Col>
      )}
      {!dataSetsOnly && (
        <Col span={4}>
          <p>File Type</p>
          <Select<string>
            id="file-type"
            style={{ width: '100%' }}
            placeholder="Select a file type"
            value={filter.filter ? filter.filter.mimeType : undefined}
            disabled={
              dataSetsOnly ||
              (lockedFilters?.filter && lockedFilters.filter.mimeType)
            }
            onSelect={onTypeChange}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="application/pdf">PDF</Select.Option>
            <Select.Option value="image/jpeg">JPEG</Select.Option>
            <Select.Option value="image/png">PNG</Select.Option>
          </Select>
        </Col>
      )}
    </>
  );
}
