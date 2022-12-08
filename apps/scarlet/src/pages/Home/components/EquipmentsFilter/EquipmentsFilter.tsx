import { useEffect, useMemo, useState } from 'react';
import { Icon, Select } from '@cognite/cogs.js';
import { EquipmentStatus, EquipmentType } from 'types';
import debounce from 'lodash/debounce';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';

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
  numberEquipments: number;
  equipmentTypeNames: string[];
};

const BinarySelectorOptions = [
  { label: 'All', value: 'all' },
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const EquipmentsFilter = ({
  loading,
  numberEquipments,
  equipmentTypeNames,
}: EquipmentsFilterProps) => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const searchQuery = queryString.parse(search);
  const [text, setText] = useState((searchQuery.s as string) || '');

  const addQuery = (key: string, value: string) => {
    history.push({
      pathname,
      search: queryString.stringify(
        { ...searchQuery, ...{ [key]: value } },
        {
          skipEmptyString: true,
        }
      ),
    });
  };

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

  const setSearchFilterDebounce = debounce(
    (val) => addQuery('s', transformSearchValue(val) || ''),
    300
  );
  useEffect(() => setSearchFilterDebounce(text), [text]);

  return (
    <Styled.Container>
      <Styled.FiltersContainer>
        <Styled.Search
          placeholder="Search by equipment ID"
          iconPlacement="left"
          value={text}
          icon="Search"
          onChange={({ target: { value } }) => setText(value)}
          clearable={{
            callback: () => setText(''),
          }}
        />
        <Select<EquipmentType | string>
          menuPlacement="bottom"
          value={
            equipmentTypeNameOptions.find(
              (opt) => opt.value === searchQuery.et
            ) || equipmentTypeNameOptions[0]
          }
          options={equipmentTypeNameOptions}
          width={220}
          onChange={(option: EquipmentTypeOption) =>
            addQuery('et', option.value)
          }
          title={
            !searchQuery.et || searchQuery.et === 'all'
              ? 'Equipment type'
              : undefined
          }
        />
        <Select<EquipmentStatus | string>
          menuPlacement="bottom"
          value={
            equipmentStatusOptionsDictionary[
              (searchQuery.es as EquipmentStatus) || 'all'
            ]
          }
          options={equipmentStatusOptions}
          width={180}
          onChange={(option: EquipmentStatusOption) =>
            addQuery('es', option.value)
          }
          title="Status"
        />
        <Select<string>
          menuPlacement="bottom"
          value={
            BinarySelectorOptions.find((opt) => opt.value === searchQuery.u1) ||
            BinarySelectorOptions[0]
          }
          options={BinarySelectorOptions}
          width={120}
          onChange={(option: U1PresenceOption) => addQuery('u1', option.value)}
          title="U1"
        />
      </Styled.FiltersContainer>
      <Styled.NumberEquipments className="cogs-body-2">
        Showing {loading ? <Icon type="Loader" /> : numberEquipments} equipment
      </Styled.NumberEquipments>
    </Styled.Container>
  );
};
