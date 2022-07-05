import { useEffect, useState } from 'react';
import { Button, Select } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { getEquipmentsPerUnit, getUnitListByFacility } from 'api';
import { facilityList } from 'config';
import { useApi } from 'hooks';
import { Facility } from 'types';

import { preapproveEquipmentList } from './utils';
import * as Styled from './style';

const SELECT_ALL = 'all';

const facilityOptions = [
  ...facilityList.map((item) => ({
    value: item,
    label: item.shortName,
  })),
];

export const Support = () => {
  const [facility, setFacility] = useState(facilityList[0]);
  const [unitId, setUnitId] = useState<string>();
  const [unitOptions, setUnitOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const { client } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const { state: unitListByFacilityQuery } = useApi(
    getUnitListByFacility,
    {},
    { skip: Boolean(unitId) }
  );
  const { state: equipmentsPerUnitQuery } = useApi(
    getEquipmentsPerUnit,
    {
      unitIds: unitListByFacilityQuery.data?.[facility.sequenceNumber].map(
        (item) => item.cdfId
      ),
    },
    { skip: !unitId }
  );

  useEffect(() => {
    if (!unitListByFacilityQuery.data) return;
    setUnitId(SELECT_ALL);
    setUnitOptions([
      { value: SELECT_ALL, label: 'All' },
      ...unitListByFacilityQuery.data[facility.sequenceNumber]
        .sort((a, b) => a.number - b.number)
        .map((unit) => ({
          value: unit.id,
          label: unit.id,
        })),
    ]);
  }, [unitListByFacilityQuery, facility]);

  const preapproveEquipment = () => {
    if (!unitId) return;

    const unitIds = unitListByFacilityQuery.data![
      facility.sequenceNumber
    ].filter((item) => unitId === SELECT_ALL || item.id === unitId);
    setLoading(true);

    preapproveEquipmentList(
      client!,
      facility,
      unitIds,
      equipmentsPerUnitQuery.data!
    ).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (unitListByFacilityQuery.loading) {
      console.debug('Loading units...');
    } else if (unitListByFacilityQuery.data) {
      console.debug('%cUnits loaded', 'color: green');
    }
    if (unitListByFacilityQuery.error) {
      console.error('Failed to load units', unitListByFacilityQuery.error);
    }
  }, [unitListByFacilityQuery]);

  useEffect(() => {
    if (equipmentsPerUnitQuery.loading) {
      console.debug('Loading equipment...');
    } else if (equipmentsPerUnitQuery.data) {
      console.debug('%cEquipment loaded', 'color: green');
    }
    if (equipmentsPerUnitQuery.error) {
      console.error('Failed to load equipment', equipmentsPerUnitQuery.error);
    }
  }, [equipmentsPerUnitQuery]);

  return (
    <Styled.Container>
      <h2 className="cogs-title-3">Scarlet Support</h2>
      <Styled.FilterContainer>
        <Select<Facility | string>
          menuPlacement="bottom"
          value={facilityOptions.find((option) => option.value === facility)}
          options={facilityOptions}
          width={220}
          onChange={(option: any) => setFacility(option.value)}
          title="Facility"
          disabled={loading}
        />
        <Select<number | string>
          menuPlacement="bottom"
          value={unitOptions.find((option) => option.value === unitId)}
          options={unitOptions}
          width={220}
          onChange={(option: any) => setUnitId(option.value)}
          title="Unit"
          icon={unitListByFacilityQuery.loading ? 'Loader' : undefined}
          disabled={unitListByFacilityQuery.loading || loading}
        />
      </Styled.FilterContainer>
      <Styled.Actions>
        <Button
          type="primary"
          onClick={preapproveEquipment}
          disabled={
            loading ||
            equipmentsPerUnitQuery.loading ||
            equipmentsPerUnitQuery.error
          }
          icon={
            loading || equipmentsPerUnitQuery.loading ? 'Loader' : undefined
          }
          iconPlacement="right"
        >
          Pre-approved equipments
        </Button>
      </Styled.Actions>
    </Styled.Container>
  );
};
