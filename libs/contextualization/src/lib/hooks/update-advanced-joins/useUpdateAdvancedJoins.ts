import { useMutation } from '@tanstack/react-query';

export const useUpdateAdvancedJoins = () => {
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
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          }),
        }
      );
      return response.json();
    }
  );
};
