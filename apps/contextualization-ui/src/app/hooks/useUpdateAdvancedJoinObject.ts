import { useCallback } from 'react';

import { useUpdateAdvancedJoins } from '@fusion/contextualization';

export const useUpdateAdvancedJoinObject = () => {
  const { mutate } = useUpdateAdvancedJoins();

  const invokeUpdateAdvancedJoinObject = useCallback(
    (
      externalId: string,
      dbName: string | null,
      tableName: string | null,
      fromColumnKey: string | undefined,
      toColumnKey: string | undefined
    ) => {
      mutate({
        externalId,
        dbName,
        tableName,
        fromColumnKey,
        toColumnKey,
      });
    },
    [mutate]
  );

  return { invokeUpdateAdvancedJoinObject };
};
