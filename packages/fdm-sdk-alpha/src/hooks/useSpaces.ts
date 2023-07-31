import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';

import { listSpaces } from '../dms/listSpaces';
import { ExternalId } from '../types';

export const useSpaces = ({ client }: { client?: CogniteClient }) => {
  const [spaces, setSpaces] = React.useState<ExternalId[]>([]);

  React.useEffect(() => {
    if (!client) {
      setSpaces([]);
      return;
    }

    listSpaces({
      client,
    }).then((response) => {
      if ('data' in response) {
        setSpaces(response.data?.items);
      }
    });
  }, [!!client]);

  return { data: spaces };
};
