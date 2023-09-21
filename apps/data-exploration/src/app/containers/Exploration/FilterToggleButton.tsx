import React from 'react';

import { Badge } from 'antd';

import { Button, Tooltip } from '@cognite/cogs.js';
import { countByFilter } from '@cognite/data-exploration';

import { useResourceFilter } from '../../context/ResourceSelectionContext';
import { useCurrentResourceType } from '../../hooks/hooks';
import zIndex from '../../utils/zIndex';

export default function FilterToggleButton({
  toggleOpen,
}: {
  toggleOpen: () => void;
}) {
  const [resourceType] = useCurrentResourceType();
  const filter = useResourceFilter(resourceType);
  const filterCount = countByFilter(filter as any);

  return (
    <Tooltip content="Filters">
      <Badge count={filterCount} style={{ zIndex: zIndex.FILTER }}>
        <Button
          icon="Configure"
          aria-label="Select Filters"
          onClick={toggleOpen}
        />
      </Badge>
    </Tooltip>
  );
}
