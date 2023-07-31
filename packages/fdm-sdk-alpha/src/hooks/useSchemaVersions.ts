import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';

import { listSchemaVersions } from '../schema/listSchemaVersions';
import { ExternalId } from '../types';

type SchemaVersion = { versions: { version: number }[] } & ExternalId;

export const useSchemaVersions = ({ client }: { client?: CogniteClient }) => {
  const [versions, setVersions] = React.useState<SchemaVersion[]>([]);

  React.useEffect(() => {
    if (!client) {
      setVersions([]);
      return;
    }

    listSchemaVersions({
      client,
    }).then((response) => {
      if ('data' in response) {
        setVersions(response.data.listApis.items);
      }
    });
  }, [!!client]);

  return { data: versions };
};
