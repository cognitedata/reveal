import { byidsSpaces } from './dms/byidsSpaces';
import { byidsModels } from './dms/byidsModels';
import { createModels } from './dms/createModels';
import { createNodes } from './dms/createNodes';
import { listNodes } from './dms/listNodes';
import { listModels } from './dms/listModels';
import { createSpace } from './dms/createSpace';
import { createSchema } from './schema/createSchema';
import { createSchemaVersion } from './schema/createSchemaVersion';
import { listSchemas } from './schema/listSchemas';
import { listSchemaVersions } from './schema/listSchemaVersions';
import { getQueryCreator } from './schema/utils/getQueryCreator';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getCogniteClientFDM = () => {
  return {
    create: {
      models: createModels,
      nodes: createNodes,
      space: createSpace,
      schema: createSchema,
      version: createSchemaVersion,
    },
    list: {
      nodes: listNodes,
      models: listModels,
      schemas: listSchemas,
      versions: listSchemaVersions,
    },
    get: {
      models: byidsModels,
      spaces: byidsSpaces,
    },
    getQueryCreator,
  };
};
