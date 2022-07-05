import { CogniteClient } from '@cognite/sdk';
import { Facility } from 'types';

export const getUnitAsset = async (
  client: CogniteClient,
  { facility, unitId }: { facility?: Facility; unitId: string }
) => {
  if (!facility) throw Error('Facility is not set');

  const unitAsset = await client.assets
    .list({
      filter: {
        name: unitId,
        externalIdPrefix: 'Unit',
        metadata: {
          facility_seqno: facility.sequenceNumber,
        },
      },
    })
    .then((result) =>
      result.items.find(
        (item) => !item.externalId?.toLocaleLowerCase().includes('test')
      )
    );

  return unitAsset;
};
