import { useMutation } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useUpdateAdvancedJoins = () => {
  const sdk = useSDK();

  return useMutation(
    async ({
      externalId,
      dbName,
      tableName,
      fromColumnKey,
      toColumnKey,
    }: {
      externalId: string;
      dbName: string | null;
      tableName: string | null;
      fromColumnKey: string | undefined;
      toColumnKey: string | undefined;
    }) => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/advancedjoins/update`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
          data: {
            items: [
              {
                externalId: externalId,
                update: {
                  matchers: {
                    set: [
                      {
                        type: 'raw',
                        dbName: dbName,
                        tableName: tableName,
                        fromColumnKey: fromColumnKey,
                        toColumnKey: toColumnKey,
                      },
                    ],
                  },
                },
              },
            ],
          },
        }
      );
      return response.data;
    }
  );
};
