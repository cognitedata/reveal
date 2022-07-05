import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { Facility } from 'types';
import { getEquipmentStateExternalId } from 'utils';
import config from 'utils/config';

export const callEquipmentExportFunction = async (
  client: CogniteClientPlayground | undefined,
  {
    facility,
    unitId,
    equipmentIds = [],
  }: {
    facility?: Facility;
    unitId?: string;
    equipmentIds?: string[];
  }
) => {
  if (!client) throw Error('Client is not set');
  if (!facility) throw Error('Facility is not set');
  if (!unitId) throw Error('UnitId is not set');

  const list = await client?.functions.list({
    name: 'converting_multiple_json_to_excel-master',
  });
  if (!list?.items.length) {
    throw Error('Export-to-excel function is not found');
  }

  const nonce = await client
    .post(`/api/playground/projects/${client.project}/sessions`, {
      data: {
        items: [
          {
            tokenExchange: true,
          },
        ],
      },
    })
    .then((response) => response.data.items?.[0].nonce);

  if (!unitId) throw Error('Failed to fetch nonce-token');

  const functionId = list.items[0].id;

  const functionCall = await client.functions.calls.callFunction(
    functionId,

    {
      data: {
        env: config.env,
        facilitySeqNo: facility.sequenceNumber,
        unitId,
        equipmentId: equipmentIds.map((id) =>
          getEquipmentStateExternalId(facility, unitId, id)
        ),
      },
    },

    nonce
  );

  return functionCall;
};
