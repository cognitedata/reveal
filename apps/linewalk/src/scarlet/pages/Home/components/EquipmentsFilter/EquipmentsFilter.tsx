import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Icon, Select } from '@cognite/cogs.js';
import { EquipmentStatus, EquipmentType } from 'scarlet/types';
import debounce from 'lodash/debounce';

import { Filter } from '../EquipmentList';
import { transformSearchValue } from '../EquipmentList/utils';

import * as Styled from './style';
import {
  EquipmentStatusOption,
  equipmentStatusOptions,
  equipmentStatusOptionsDictionary,
  EquipmentTypeOption,
  equipmentTypeOptions,
  equipmentTypeOptionsDictionary,
} from './utils';

type EquipmentsFilterProps = {
  loading: boolean;
  filter: Filter;
  setFilter: Dispatch<SetStateAction<Filter>>;
  numberEquipments: number;
};

export const EquipmentsFilter = ({
  loading,
  filter,
  setFilter,
  numberEquipments,
}: EquipmentsFilterProps) => {
  const [search, setSearch] = useState('');

  const onChangeEquipmentType = useCallback(
    (equipmentTypeOption: EquipmentTypeOption) =>
      setFilter((filter) => ({
        ...filter,
        equipmentType: equipmentTypeOption.value,
      })),
    []
  );

  const onChangeEquipmentStatus = useCallback(
    (equipmentStatusOption: EquipmentStatusOption) =>
      setFilter((filter) => ({
        ...filter,
        equipmentStatus: equipmentStatusOption.value,
      })),
    []
  );

  const setFilterWithDebounce = useCallback(
    debounce((search) => {
      setFilter((filter) => ({ ...filter, search }));
    }, 300),
    []
  );

  useEffect(
    () => setFilterWithDebounce(transformSearchValue(search)),
    [search]
  );

  return (
    <Styled.Container>
      <Styled.FiltersContainer>
        <Styled.Search
          placeholder="Search by equipment ID"
          iconPlacement="left"
          value={search}
          icon="Search"
          onChange={({ target: { value } }) => {
            setSearch(value);
          }}
          clearable={{
            callback: () => {
              setSearch('');
            },
          }}
        />
        <Select<EquipmentType | string>
          menuPlacement="bottom"
          value={equipmentTypeOptionsDictionary[filter.equipmentType]}
          options={equipmentTypeOptions}
          width={220}
          onChange={onChangeEquipmentType}
          title={filter.equipmentType === 'all' ? 'Equipment type' : undefined}
        />
        <Select<EquipmentStatus | string>
          menuPlacement="bottom"
          value={equipmentStatusOptionsDictionary[filter.equipmentStatus]}
          options={equipmentStatusOptions}
          width={180}
          onChange={onChangeEquipmentStatus}
          title={filter.equipmentStatus === 'all' ? 'Status' : undefined}
        />
      </Styled.FiltersContainer>
      <Styled.NumberEquipments className="cogs-body-2">
        Showing {loading ? <Icon type="Loader" /> : numberEquipments} equipment
      </Styled.NumberEquipments>
    </Styled.Container>
  );
};
