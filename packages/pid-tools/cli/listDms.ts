/* eslint-disable no-console */
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';
import { listNodes, ModelNodeMap, ModelEdgeMap, listEdges } from '../src/dms';

import findUniqueFileByName from './utils/findUniqueFileByName';

export const listDms = async (argv: any) => {
  const typedArgv = argv as MsalClientOptions & {
    svgFileName: string;
    filePage: number;
    spaceExternalId: string;
  };
  const clientOptions: MsalClientOptions = typedArgv;
  const { svgFileName, filePage, spaceExternalId } = typedArgv;

  const client = await getMsalClient(clientOptions);
  // Find fileId of the file referenced in the GraphDocument in the project
  const fileId = (await findUniqueFileByName(client, svgFileName)).id;

  const nodeModelNames: (keyof ModelNodeMap)[] = [
    'Viewbox',
    'Symbol',
    'FileConnection',
    'Line',
  ];
  console.log('Upserted nodes:');
  await Promise.all(
    nodeModelNames.map(async (model) => {
      const items = await listNodes(client, {
        model,
        spaceExternalId,
        filters: [
          {
            property: 'filePage',
            values: [filePage],
          },
          {
            property: 'fileId',
            values: [fileId],
          },
          {
            property: 'modelName',
            values: [model],
          },
        ],
        limit: Infinity,
      });
      console.log(`  ${model}: ${items.length}`);
    })
  );

  const edgeModelNames: (keyof ModelEdgeMap)[] = ['InstanceEdge'];
  console.log('Upserted edges:');
  await Promise.all(
    edgeModelNames.map(async (model) => {
      const items = await listEdges(client, {
        model,
        spaceExternalId,
        filters: [
          {
            property: 'filePage',
            values: [filePage],
          },
          {
            property: 'fileId',
            values: [fileId],
          },
          {
            property: 'modelName',
            values: [model],
          },
        ],
        limit: Infinity,
      });
      console.log(`  ${model}: ${items.length}`);
    })
  );
};

export default listDms;
