import sdk from 'sdk-singleton';
import { Call, Function } from 'types';

export const getFunctions = async (): Promise<Function[]> => {
  const functions = await sdk
    .get(`/api/playground/projects/${sdk.project}/functions`)
    .then(response => {
      return response.data?.items as Function[];
    });

  const calls = await Promise.all(
    functions.map(({ id }) =>
      sdk
        .get(`/api/playground/projects/${sdk.project}/functions/${id}/calls`)
        .then((response: any) => response?.data?.items as Call[])
    )
  );

  const stuff = functions.map((f, i) => ({ ...f, calls: calls[i] }));
  return stuff;
  // return functions;
};


// export const getFunction = (sdk: CogniteClient) => async (id: number) => {
//   // @ts-ignore
//   const function = sdk
//     .get(`/api/playground/projects/${sdk.project}/functions/${id}`)
//     .then(response => response.data?.items) as Function;

//   const calls = await Promise.all(
//     functions.map(id =>
//       sdk
//         .get(`/api/playground/projects/${sdk.project}/functions/${id}/calls`)
//         .then((response: any) => response?.data?.items)
//     )
//   );

//   return functions.map((f, i) => ({ ...f, calls: calls[i] }))
// };
