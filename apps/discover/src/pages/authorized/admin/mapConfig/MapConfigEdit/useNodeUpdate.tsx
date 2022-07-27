import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

type DefaultValue = string | number | boolean;
export type SavingFields<T = DefaultValue> = {
  id: [string, string];
  key: string;
  value: T;
};
export type Node<T = DefaultValue> = Record<
  string,
  SavingFields<T>['value']
> & {
  externalId: string;
};
export const useNodeUpdate = (existing?: Node) => {
  const clientCognite = getCogniteSDKClient();
  const clientCogniteFDM = getCogniteClientFDM();

  return (fields: SavingFields) => {
    if (!existing) {
      console.log('Not setup');
      return () => false;
    }

    // console.log('Trying to save fields', fields);
    return clientCogniteFDM.create.nodes({
      client: clientCognite,
      items: [
        {
          ...existing,
          [fields.key]: fields.value,
        },
      ],
      spaceName: fields.id[0],
      modelName: fields.id[1],
    });
  };
};

export type NodeUpdateResponse = ReturnType<typeof useNodeUpdate>;
