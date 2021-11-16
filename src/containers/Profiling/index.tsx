import React from 'react';
import { Flex, Loader } from '@cognite/cogs.js';
import { useTableData } from 'hooks/table-data';

export const Profiling = (): JSX.Element => {
  const { isLoading } = useTableData();

  return (
    <Flex direction="column">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* TODO CDFUX-952 
          PROFILE PAGE HERE */}
        </>
      )}
    </Flex>
  );
};
