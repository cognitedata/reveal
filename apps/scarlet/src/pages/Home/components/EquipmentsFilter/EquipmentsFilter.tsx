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
  U1PresenceOption,
} from './utils';

type EquipmentsFilterProps = {
  loading: boolean;
  filter: Filter;
  numberEquipments: number;
  equipmentTypeNames: string[];
  setFilter: Dispatch<SetStateAction<Filter>>;
};

const BinarySelectorOptions = [
  { label: 'All', value: 'all' },
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const EquipmentsFilter = ({
  loading,
  filter,
  numberEquipments,
  equipmentTypeNames,
  setFilter,
}: EquipmentsFilterProps) => {
  const [search, setSearch] = useState('');

  const onChangeEquipmentType = useCallback(
    (option: EquipmentTypeOption) =>
      setFilter((filter) => ({
        ...filter,
        equipmentTypeName: option.value,
      })),
    []
  );

  const onChangeEquipmentStatus = useCallback(
    (option: EquipmentStatusOption) =>
      setFilter((filter) => ({
        ...filter,
        equipmentStatus: option.value,
      })),
    []
  );

  const onChangeU1Presence = useCallback(
    (option: U1PresenceOption) =>
      setFilter((filter) => ({ ...filter, U1Presence: option.value })),
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
        <Select<string>
          menuPlacement="bottom"
          value={BinarySelectorOptions.find(
            (opt) => opt.value === filter.U1Presence
          )}
          options={BinarySelectorOptions}
          width={120}
          onChange={onChangeU1Presence}
          title="U1"
        />
      </Styled.FiltersContainer>
      <Styled.NumberEquipments className="cogs-body-2">
        Showing {loading ? <Icon type="Loader" /> : numberEquipments} equipment
      </Styled.NumberEquipments>
    </Styled.Container>
  );
};
