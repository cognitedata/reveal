import { byidsSpaces } from './dms/byidsSpaces';
import { byidsModels } from './dms/byidsModels';
import { createModels } from './dms/createModels';
import { createNodes } from './dms/createNodes';
import { listNodes } from './dms/listNodes';
import { listSpaces } from './dms/listSpaces';
import { listEdges } from './dms/listEdges';
import { listModels } from './dms/listModels';
import { createSpace } from './dms/createSpace';
import { createEdges } from './dms/createEdges';
import { createSchema } from './schema/createSchema';
import { createSchemaVersion } from './schema/createSchemaVersion';
import { listSchemas } from './schema/listSchemas';
import { listSchemaVersions } from './schema/listSchemaVersions';
import { getQueryCreator } from './schema/utils/getQueryCreator';
import { useSpaces } from './hooks/useSpaces';
import { useModels } from './hooks/useModels';
import { useNodes } from './hooks/useNodes';
import { useSchemas } from './hooks/useSchemas';
import { useSchemaVersions } from './hooks/useSchemaVersions';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getCogniteClientFDM = () => {
  return {
    create: {
      models: createModels,
      nodes: createNodes,
      space: createSpace,
      edges: createEdges,
      schema: createSchema,
      version: createSchemaVersion,
    },
    list: {
      nodes: listNodes,
      models: listModels,
      spaces: listSpaces,
      edges: listEdges,
      schemas: listSchemas,
      versions: listSchemaVersions,
    },
    get: {
      models: byidsModels,
      types: byidsModels, // new name?

      spaces: byidsSpaces,
    },
    hooks: {
      list: {
        useSpaces,
        useModels,
        useNodes,
        useSchemas,
        useSchemaVersions,
      },
    },
    getQueryCreator,
  };
};

export * from './types';
