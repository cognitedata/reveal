import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Spin } from 'antd';
import { Colors, Input } from '@cognite/cogs.js';
import { ResourceType } from 'modules/sdk-builder/types';
import { Flex } from 'components/Common';
import DataSetSelect from 'components/DataSetSelect';
import { searchCountSelector } from 'pages/SelectionPage/selectors';
import { LabelFilter } from 'components/LabelFilter';
// import FilterMenu from './FilterMenu';
import omit from 'lodash/omit';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

type Props = {
  type: ResourceType;
  filter: any;
  isSelectAll: boolean;
  selectedRowKeys: number[];
  updateFilter: (f: any) => void;
};

export default function SelectionBar(props: Props): JSX.Element {
  const { type, filter, isSelectAll, selectedRowKeys, updateFilter } = props;
  const count = useSelector(searchCountSelector(type, filter));

  const labels = filter?.filter?.labels?.containsAny ?? [];

  const onLabelsChange = (newLabels?: { externalId: string }[]) => {
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

  const dataSetIds = (filter.filter?.dataSetIds || []).map((el: any) => el.id);
  const selected = isSelectAll ? count || 0 : selectedRowKeys.length;
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
            isMulti
            resourceType={type}
            selectedDataSetIds={dataSetIds}
            onDataSetSelected={onDataSetSelected}
          />
          <LabelFilter value={labels} setValue={onLabelsChange} />
        </InputRow>
        <Selected>
          {selected} {type} selected
        </Selected>
      </StyledFlex>
      <FilterBar row>
        <Results>{results} results</Results>
      </FilterBar>
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
const Results = styled.span`
  color: ${Colors['greyscale-grey6'].hex()};
`;
const FilterBar = styled(Flex)`
  justify-content: flex-end;
  margin-bottom: 16px;
`;
