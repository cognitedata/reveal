import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Icon, Select } from '@cognite/cogs.js';
import { EquipmentStatus, EquipmentType } from 'types';
import debounce from 'lodash/debounce';

import { Filter } from '../EquipmentList';
import { transformSearchValue } from '../EquipmentList/utils';

import * as Styled from './style';
import {
  EquipmentStatusOption,
  equipmentStatusOptions,
  equipmentStatusOptionsDictionary,
  EquipmentTypeOption,
} from './utils';

type EquipmentsFilterProps = {
  loading: boolean;
  filter: Filter;
  numberEquipments: number;
  equipmentTypeNames: string[];
  setFilter: Dispatch<SetStateAction<Filter>>;
};

export const EquipmentsFilter = ({
  loading,
  filter,
  numberEquipments,
  equipmentTypeNames,
  setFilter,
}: EquipmentsFilterProps) => {
  const [search, setSearch] = useState('');

  const onChangeEquipmentType = useCallback(
    (equipmentTypeOption: EquipmentTypeOption) =>
      setFilter((filter) => ({
        ...filter,
        equipmentTypeName: equipmentTypeOption.value,
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

  const equipmentTypeNameOptions = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...equipmentTypeNames.map((typeName) => ({
        label: typeName,
        value: typeName,
      })),
    ],
    [equipmentTypeNames]
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
          value={equipmentTypeNameOptions.find(
            (opt) => opt.value === filter.equipmentTypeName
          )}
          options={equipmentTypeNameOptions}
          width={220}
          onChange={onChangeEquipmentType}
          title={
            filter.equipmentTypeName === 'all' ? 'Equipment type' : undefined
          }
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
