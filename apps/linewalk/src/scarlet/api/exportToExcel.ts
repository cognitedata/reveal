import { CogniteClientPlayground } from '@cognite/sdk-playground';
import { Facility } from 'scarlet/types';
import config from 'utils/config';

export const exportToExcel = async (
  client: CogniteClientPlayground,
  {
    facility,
    unitId,
    selectedIds = [],
  }: {
    facility?: Facility;
    unitId: string;
    selectedIds?: string[];
  }
) => {
  if (!client) throw Error('Client is not set');
  if (!facility) throw Error('Facility is not set');

  const list = await client?.functions.list({
    name: 'converting_multiple_json_to_excel-master',
  });
  if (!list?.items.length) {
    throw Error('Export-to-excel function is not found');
  }

  const functionId = list.items[0].id;

  const functionCall = await client.functions.calls.callFunction(
    functionId,

    {
      data: {
        env: config.env,
        facilitySeqNo: facility.sequenceNumber,
        unitId,
        equipmentId: selectedIds,
      },
      nonce: 'nonce',
    },

    // { unitId },
    'nonce'
  );

  console.log(functionCall);

  //   for (let i = 0; i < 10; i++) {
  //     // eslint-disable-next-line no-await-in-loop
  //     await sleep(5000);
  //     // eslint-disable-next-line no-await-in-loop
  //     const result = await client.functions.calls.retrieveResponse(
  //       functionCall.functionId,
  //       functionCall.id
  //     );
  //     console.log('Export2Excel result:', result);
  //   }
};

// const sleep = (time = 1000) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, time);
//   });
