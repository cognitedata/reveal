import React from 'react';
import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { ResourceType } from 'modules/sdk-builder/types';
import { Flex } from 'components/Common';
import DataSetSelect from 'components/DataSetSelect';
// import FilterMenu from './FilterMenu';

type Props = {
  type: ResourceType;
  filter: any;
  updateFilter: (f: any) => void;
};

export default function SelectionBar(props: Props): JSX.Element {
  const { type, filter, updateFilter } = props;

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
    updateFilter(newFilter);
  };

  const dataSetIds = (filter.filter?.dataSetIds || []).map((el: any) => el.id);

  return (
    <StyledFlex row align>
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
    </StyledFlex>
  );
}

const StyledFlex = styled(Flex)`
  width: 100%;
  margin: 24px 0 12px 0;
  & > * {
    margin-right: 8px;
  }
`;
