import React, { Key, ReactNode } from 'react';

import { Flex, Chip, ChipProps } from '@cognite/cogs.js';

type TableFilterLabel = {
  key: Key;
  enabled: boolean;
  onClick: ChipProps['onClick'];
  content: ReactNode;
};

type TableFilterLabelsProps = {
  labels: TableFilterLabel[];
};

export const TableFilterLabels = ({ labels }: TableFilterLabelsProps) => {
  return (
    <Flex gap={8}>
      {labels?.map(
        (label) =>
          label?.enabled && (
            <Chip
              size="medium"
              icon="Close"
              iconPlacement="right"
              onClick={label?.onClick}
              key={label?.key}
              label={String(label?.content)}
            />
          )
      )}
    </Flex>
  );
};
