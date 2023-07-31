import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';

import { listNodes } from '../dms/listNodes';
import { ExternalId } from '../types';

export const useNodes = ({
  client,
  space,
  model,
}: {
  client?: CogniteClient;
  space: string;
  model: string;
}) => {
  const [nodes, setNodes] = React.useState<ExternalId[]>([]);

  React.useEffect(() => {
    if (!client || !model || !space) {
      setNodes([]);
      return;
    }

    listNodes({
      client,
      query: {
        model: [space, model],
        filter: {},
      },
    }).then((response) => {
      if ('data' in response) {
        setNodes(response.data?.items);
      }
    });
  }, [!!client, space, model]);

  return { data: nodes };
};
