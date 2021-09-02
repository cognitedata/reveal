import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import omit from 'lodash/omit';
import { Spin } from 'antd';
import { Button, Colors, Input } from '@cognite/cogs.js';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { ResourceType } from 'modules/sdk-builder/types';
import { searchCountSelector } from 'pages/PageSelection/selectors';
import { Flex } from 'components/Common';
import {
  DataSetSelect,
  RootAssetSelect,
  MimeTypeSelect,
  LabelSelect,
  FilterList,
  FilterMenu,
} from 'components/Filters';
import { useResourceCount } from 'hooks';

type Props = {
  type: ResourceType | 'diagrams';
  filter: any;
  updateFilter: (f: any) => void;
  setShowSelected: (val: boolean) => void;
  showSelected: boolean;
};

export default function SelectionBar(props: Props): JSX.Element {
  const { type, filter, updateFilter, setShowSelected, showSelected } = props;
  const count = useSelector(
    searchCountSelector(type === 'diagrams' ? 'files' : type, filter)
  );
  const resourceCounts = useResourceCount();

  const labels: { externalId: string }[] =
    filter?.filter?.labels?.containsAny ?? [];
  const dataSetIds = (filter.filter?.dataSetIds || []).map(
    (el: { id: number }) => el.id
  );
  const rootAssets = (filter.filter?.rootIds || []).map(
    (el: { id: number }) => el.id
  );

  const onRootAssetSelected = (rootAssetIds: number[]) => {
    const id = rootAssetIds[0];
    const newFilter = {
      ...filter,
      filter: {
        ...filter.filter,
        rootIds: id ? [{ id }] : undefined,
      },
    };
    if (id) {
      trackUsage(PNID_METRICS.filters.byRootAsset, {
        rootAssetId: id,
      });
    }
    updateFilter(newFilter);
  };
  const onLabelsSelected = (externalIds: string[]) => {
    const newLabels = externalIds.map((externalId) => ({ externalId }));
    if (newLabels?.length) {
      trackUsage(PNID_METRICS.filters.byLabels, {
        count: newLabels.length,
      });
      updateFilter({
        ...filter,
        filter: {
          ...filter.filter,
          labels: {
            containsAny: newLabels,
          },
        },
      });
    } else {
      updateFilter({
        ...filter,
        filter: {
          ...omit(filter.filter, 'labels'),
        },
      });
    }
  };
  const onDataSetSelected = (ids: number[]) => {
    const newDataSetIds =
      ids.length === 0 ? undefined : ids.map((id) => ({ id }));
    const newFilter = {
      ...filter,
      filter: {
        ...filter.filter,
        dataSetIds: newDataSetIds,
      },
    };
    if (newDataSetIds) {
      trackUsage(PNID_METRICS.filters.byDataSet, {
        count: newDataSetIds.length,
      });
    }
    updateFilter(newFilter);
  };
  const onMimeTypeSelected = (mimeType: string[]) => {
    const newMimeType = mimeType[0];
    const newFilter = {
      ...filter,
      filter: {
        ...filter.filter,
        mimeType: newMimeType,
      },
    };
    if (newMimeType) {
      trackUsage(PNID_METRICS.filters.byMimeType, {
        mimeType: newMimeType,
      });
    }
    updateFilter(newFilter);
  };

  const onNameClear = () => {
    const newFilter = {
      ...filter,
      search: undefined,
    };
    updateFilter(newFilter);
  };
  const onNameSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newFilter = {
      ...filter,
      search:
        value.length > 0
          ? {
              ...filter.search,
              name: value,
            }
          : undefined,
    };

    if (value) {
      trackUsage(PNID_METRICS.filters.byDataSet, {
        query: value,
      });
    }
    updateFilter(newFilter);
  };

  useEffect(() => {
    setShowSelected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const selected = resourceCounts[type] ?? 0;
  const results = count ?? <Spin size="small" />;

  return (
    <Flex column>
      <StyledFlex row align>
        <InputRow row>
          {/* <FilterMenu /> */}
          <Input
            placeholder="Filter by name"
            style={{ width: '250px' }}
            value={filter.search?.name ?? ''}
            onChange={onNameSearchChange}
          />
          <DataSetSelect
            resourceType={type === 'diagrams' ? 'files' : type}
            selectedDataSetIds={dataSetIds}
            onDataSetSelected={onDataSetSelected}
          />
          <FilterMenu
            options={[
              <LabelSelect
                selectedLabels={labels.map((l) => l.externalId)}
                onLabelsSelected={onLabelsSelected}
              />,
              type === 'assets' ? (
                <RootAssetSelect
                  selectedRootAssets={rootAssets}
                  onRootAssetSelected={onRootAssetSelected}
                />
              ) : (
                <MimeTypeSelect
                  selectedMimeType={[filter.filter?.mimeType]}
                  onMimeTypeSelected={onMimeTypeSelected}
                />
              ),
            ]}
          />
        </InputRow>
        <Selected>
          <Button
            type="link"
            disabled={!selected}
            onClick={() => setShowSelected(!showSelected)}
          >
            {showSelected
              ? `Show all ${type}`
              : `Show ${selected} ${type} selected`}
          </Button>
        </Selected>
      </StyledFlex>
      <FilterBar row>
        <FilterList
          labels={labels}
          dataSetIds={dataSetIds}
          onDataSetsChange={onDataSetSelected}
          onLabelsChange={onLabelsSelected}
          searchQuery={filter?.search?.name}
          mimeType={filter.filter?.mimeType}
          onMimeTypeChange={onMimeTypeSelected}
          onQueryClear={onNameClear}
          onClearAll={() => updateFilter({ filter: {}, search: undefined })}
        />
      </FilterBar>
      <Results>{results} results</Results>
    </Flex>
  );
}

const StyledFlex = styled(Flex)`
  width: 100%;
  margin: 24px 0 12px 0;
  justify-content: space-between;
`;
const InputRow = styled(Flex)`
  & > * {
    margin-right: 8px;
  }
`;
const Selected = styled.span`
  color: ${Colors['greyscale-grey7'].hex()};
  font-weight: 500;
`;
const Results = styled(Flex)`
  color: ${Colors['greyscale-grey6'].hex()};
  justify-content: flex-end;
  margin-bottom: 20px;
`;
const FilterBar = styled(Flex)`
  justify-content: space-between;
  margin-bottom: 16px;
`;
