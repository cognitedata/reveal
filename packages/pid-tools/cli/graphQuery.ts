import fsPromises from 'fs/promises';
import path from 'path';

import { DIAGRAM_PARSER_JSON_EXTERNAL_ID } from '../src/constants';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';
import { DiagramInstance, PidDocument } from '../src';

import { loadGraphDocument } from './upsertDms';
import { downloadFileByUrl } from './downloadDwgFiles';
import { SiteAndUnit } from './createSiteUnitEvents';
import createDirIfNotExists from './utils/createDirIfNotExists';

// Print outs the isolation boundary around `instanceId` or `assetId`.
// Currently limited to only one file.
const graphQuery = async (argv: any) => {
  const typedArgv = argv as MsalClientOptions &
    SiteAndUnit & {
      svgFileName: string;
      instanceId?: string;
      assetId?: number;
    };
  const { svgFileName, instanceId, assetId } = typedArgv;

  if (instanceId === undefined && assetId === undefined) {
    throw Error('Must provide either instanceId or assetId (no provided)');
  }
  if (instanceId !== undefined && assetId !== undefined) {
    throw Error('Must provide either instanceId or assetId (both provided)');
  }

  const saveDir = 'cli/data/tmp';

  const client = await getMsalClient(typedArgv);

  const svgFileInfoRespond = await client.files.list({
    filter: {
      name: svgFileName,
    },
  });
  const svgFileInfo = svgFileInfoRespond.items[0];

  if (
    svgFileInfo === undefined ||
    svgFileInfo.metadata === undefined ||
    svgFileInfo.metadata[DIAGRAM_PARSER_JSON_EXTERNAL_ID] === undefined
  ) {
    throw new Error(`No svg file found with file name ${svgFileName}`);
  }

  const jsonExternalId = svgFileInfo.metadata[DIAGRAM_PARSER_JSON_EXTERNAL_ID];

  const links = await client.files.getDownloadUrls([
    { externalId: jsonExternalId },
  ]);
  const link = links[0];

  createDirIfNotExists(saveDir);

  await downloadFileByUrl(link.downloadUrl, `${saveDir}/${jsonExternalId}`);

  const fileNames = await fsPromises.readdir(saveDir);
  const fileName = fileNames.find((name) => name.endsWith(jsonExternalId));

  if (fileName === undefined) {
    throw new Error(`No downloaded json file found`);
  }

  const pathGraphDocument = path.resolve(saveDir, fileName);

  const graphDocument = await loadGraphDocument(pathGraphDocument);

  const instances = [...graphDocument.lines, ...graphDocument.symbolInstances];

  let diagramInstance: DiagramInstance | undefined;
  if (assetId !== undefined) {
    diagramInstance = instances.find(
      (instance) => instance.assetId === assetId
    );
  } else {
    diagramInstance = instances.find((instance) => instance.id === instanceId);
  }

  const isolationBoundary = PidDocument.getIsolationBoundary(diagramInstance, {
    instances,
    connections: graphDocument.connections,
  });

  // eslint-disable-next-line no-console
  console.log({ isolationBoundary });
};

export default graphQuery;
