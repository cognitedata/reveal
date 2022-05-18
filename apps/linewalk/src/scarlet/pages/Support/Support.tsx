import { useEffect, useState } from 'react';
import { Button, Select } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { getEquipmentsPerUnit, getUnitListByFacility } from 'scarlet/api';
import { facilityList } from 'scarlet/config';
import { useApi } from 'scarlet/hooks';
import { Facility } from 'scarlet/types';

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

  const unitListByFacility = useApi(
    getUnitListByFacility,
    {},
    { skip: Boolean(unitId) }
  );
  const equipmentsPerUnit = useApi(
    getEquipmentsPerUnit,
    {
      unitIds: unitListByFacility.data?.[facility.sequenceNumber].map(
        (item) => item.cdfId
      ),
    },
    { skip: !unitId }
  );

  useEffect(() => {
    if (!unitListByFacility.data) return;
    setUnitId(SELECT_ALL);
    setUnitOptions([
      { value: SELECT_ALL, label: 'All' },
      ...unitListByFacility.data[facility.sequenceNumber]
        .sort((a, b) => a.number - b.number)
        .map((unit) => ({
          value: unit.id,
          label: unit.id,
        })),
    ]);
  }, [unitListByFacility, facility]);

  const preapproveEquipment = () => {
    if (!unitId) return;

    const unitIds = unitListByFacility.data![facility.sequenceNumber].filter(
      (item) => unitId === SELECT_ALL || item.id === unitId
    );
    setLoading(true);

    preapproveEquipmentList(
      client!,
      facility,
      unitIds,
      equipmentsPerUnit.data!
    ).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (unitListByFacility.loading) {
      console.debug('Loading units...');
    } else if (unitListByFacility.data) {
      console.debug('%cUnits loaded', 'color: green');
    }
    if (unitListByFacility.error) {
      console.error('Failed to load units', unitListByFacility.error);
    }
  }, [unitListByFacility]);

  useEffect(() => {
    if (equipmentsPerUnit.loading) {
      console.debug('Loading equipment...');
    } else if (equipmentsPerUnit.data) {
      console.debug('%cEquipment loaded', 'color: green');
    }
    if (equipmentsPerUnit.error) {
      console.error('Failed to load equipment', equipmentsPerUnit.error);
    }
  }, [equipmentsPerUnit]);

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
          icon={unitListByFacility.loading ? 'Loader' : undefined}
          disabled={unitListByFacility.loading || loading}
        />
      </Styled.FilterContainer>
      <Styled.Actions>
        <Button
          type="primary"
          onClick={preapproveEquipment}
          disabled={
            loading || equipmentsPerUnit.loading || equipmentsPerUnit.error
          }
          icon={loading || equipmentsPerUnit.loading ? 'Loader' : undefined}
          iconPlacement="right"
        >
          Pre-approved equipments
        </Button>
      </Styled.Actions>
    </Styled.Container>
  );
};
