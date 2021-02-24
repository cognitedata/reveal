import React from 'react';
import { Input, Col } from 'antd';
import AssetSelect from 'components/AssetSelect';
import { InternalId } from '@cognite/sdk';
import { Filter } from 'modules/search';
import DataSetSelect from 'components/DataSetSelect';
import { Icon, Colors } from '@cognite/cogs.js';

type Props = {
  updateFilter?: (filter: Filter) => void;
  filter?: Filter;
  dataSetsOnly?: boolean;
  onDataSetsUpdate?: (currentDataSets: { id: number }[]) => void;
  noTypeCheck?: boolean;
};
export default function AssetSearchBar({
  filter = {},
  updateFilter = () => undefined,
  dataSetsOnly = false,
  onDataSetsUpdate,
  noTypeCheck = false,
}: Props) {
  const selectedDataSetIds = (filter.filter?.dataSetIds || []).map(
    (e: any) => e?.id
  );

  return (
    <>
      <Col span={!dataSetsOnly ? 4 : 6}>
        <p>Data set</p>
        <DataSetSelect
          multiple
          noTypeCheck={noTypeCheck}
          style={{ width: '100%' }}
          selectedDataSetIds={selectedDataSetIds}
          type="assets"
          onDataSetSelected={(ids: number[]) => {
            if (onDataSetsUpdate) {
              onDataSetsUpdate(ids.map((id) => ({ id })));
            } else {
              updateFilter({
                ...filter,
                filter: {
                  ...filter.filter,
                  dataSetIds: ids.map((id) => ({ id })),
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
            placeholder="Filter by name/description"
            value={filter.search ? filter.search.query : ''}
            onChange={(ev) =>
              updateFilter({
                ...filter,
                search:
                  ev.target.value.length > 0
                    ? {
                        ...filter.search,
                        query: ev.target.value,
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
          <p>Root assets</p>
          <AssetSelect
            disabled={dataSetsOnly}
            style={{ width: '100%' }}
            placeholder="Filter by root asset"
            rootOnly
            selectedAssetId={
              filter.filter &&
              filter.filter.rootIds &&
              filter.filter.rootIds.length > 0
                ? (filter.filter.rootIds[0] as InternalId).id
                : undefined
            }
            onAssetSelected={(asset) =>
              updateFilter({
                ...filter,
                filter: {
                  ...filter.filter,
                  rootIds: asset ? [{ id: asset.id }] : undefined,
                },
              })
            }
          />
        </Col>
      )}
    </>
  );
}
