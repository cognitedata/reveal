import * as React from 'react';
import { CogniteClient } from '@cognite/sdk';

import { ExternalId } from '../types';
import { listModels } from '../dms/listModels';

export const useModels = ({
  client,
  model,
}: {
  client?: CogniteClient;
  model: string;
}) => {
  const [models, setModels] = React.useState<ExternalId[]>([]);

  React.useEffect(() => {
    if (!client || !model) {
      setModels([]);
      return;
    }

    listModels({
      client,
      spaceExternalId: model,
    }).then((response) => {
      if ('data' in response) {
        setModels(response.data?.items);
      }
    });
  }, [!!client, model]);

  return { data: models };
};
