import React from 'react';
import { Badge } from 'antd';
import { Button, Tooltip } from '@cognite/cogs.js';
import { useResourceFilter } from 'app/context/ResourceSelectionContext';
import { useCurrentResourceType } from 'app/hooks';
import { countByFilter } from '@cognite/data-exploration';

export default function FilterToggleButton({
  toggleOpen,
}: {
  toggleOpen: () => void;
}) {
  const [resourceType] = useCurrentResourceType();
  const filter = useResourceFilter(resourceType);
  const filterCount = countByFilter(filter);

  return (
    <Tooltip content="Filters">
      <Badge count={filterCount} style={{ zIndex: 2 }}>
        <Button
          icon="Configure"
          aria-label="Select Filters"
          onClick={toggleOpen}
        />
      </Badge>
    </Tooltip>
  );
}
