import React from 'react';
import { Alert } from 'antd';
import { Flex, Loader } from '@cognite/cogs.js';
import { useActiveTable } from 'hooks/table-tabs';
import { useRawProfile } from 'hooks/sdk-queries';

export const Profiling = (): JSX.Element => {
  const [[database, table] = []] = useActiveTable();

  const { data, isLoading, isError, error } = useRawProfile(
    {
      database: database!,
      table: table!,
    },
    { enabled: !!database && !!table }
  );

  if (isError) {
    return (
      <div>
        <Alert
          type="error"
          message="Profiling service error"
          description={JSON.stringify(error, null, 2)}
        />
      </div>
    );
  }

  return (
    <Flex direction="column">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </Flex>
  );
};
