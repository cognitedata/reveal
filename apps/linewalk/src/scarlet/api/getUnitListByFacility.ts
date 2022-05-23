import { CogniteClient } from '@cognite/sdk';
import { DataSetId, UnitListByFacility, UnitListItem } from 'scarlet/types';
import { facilityList } from 'scarlet/config';

export const getUnitListByFacility = async (
  client: CogniteClient
): Promise<UnitListByFacility> => {
  const unitsByFacility = facilityList.reduce(
    (result, facility) => ({
      ...result,
      [facility.sequenceNumber]: [],
    }),
    {} as UnitListByFacility
  );

  let next;
  let list = await client.assets.list({
    filter: {
      externalIdPrefix: 'Unit_',
      dataSetIds: [{ id: DataSetId.PCMS }],
    },
    limit: 1000,
  });

  do {
    if (next) list = await next(); // eslint-disable-line no-await-in-loop
    list.items.forEach((item) => {
      const facility = facilityList.find(
        (facility) => facility.sequenceNumber === item.metadata?.facility_seqno
      );
      if (!facility || !facility.unitPattern.test(item.name)) return;

      unitsByFacility[facility.sequenceNumber].push({
        id: item.name,
        cdfId: item.id,
        number: getUnitNumber(item.name, facility.unitPattern),
      } as UnitListItem);
    });

    next = list.next;
  } while (list.next);

  return unitsByFacility;
};

const getUnitNumber = (unitId: string, unitPattern: RegExp) => {
  const matches = unitId.match(unitPattern);
  if (matches) return parseFloat(matches[1]);

  return undefined;
};
