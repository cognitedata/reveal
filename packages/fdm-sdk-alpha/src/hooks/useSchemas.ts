import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';

import { listSchemas } from '../schema/listSchemas';
import { ExternalId } from '../types';

export const useSchemas = ({ client }: { client?: CogniteClient }) => {
  const [schemas, setSchemas] = React.useState<ExternalId[]>([]);

  React.useEffect(() => {
    if (!client) {
      setSchemas([]);
      return;
    }

    listSchemas({
      client,
    }).then((response) => {
      if ('data' in response) {
        setSchemas(response.data.listApis.edges.map((edge) => edge.node));
      }
    });
  }, [!!client]);

  return { data: schemas };
};
