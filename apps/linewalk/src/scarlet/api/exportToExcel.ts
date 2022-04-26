import { CogniteClientPlayground } from '@cognite/sdk-playground-v5';

export const exportToExcel = async (
  client?: CogniteClientPlayground,
  unitName?: string
) => {
  if (!client) throw Error('Client is not set');

  const list = await client?.functions.list({
    name: 'converting_multiple_json_to_excel-master',
  });
  if (!list?.items.length) {
    throw Error('Export-to-excel function is not found');
  }

  const functionId = list.items[0].id;

  const functionCall = await client.functions.calls.callFunction(
    functionId,
    { unitName },
    'nonce'
  );

  console.log(functionCall);

  // for (let i = 0; i < 10; i++) {
  //   // eslint-disable-next-line no-await-in-loop
  //   await sleep(5000);
  //   // eslint-disable-next-line no-await-in-loop
  //   const result = await client.functions.calls.retrieveResponse(
  //     functionCall.functionId,
  //     functionCall.id
  //   );
  //   console.log('Export2Excel result:', result);
  // }
};

// const sleep = (time = 1000) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, time);
//   });
