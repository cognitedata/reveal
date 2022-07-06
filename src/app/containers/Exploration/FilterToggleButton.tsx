import React from 'react';
import { Badge, Button } from 'antd';
import { Icon } from '@cognite/cogs.js';
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
    <Badge count={filterCount} style={{ zIndex: 2 }}>
      <Button
        onClick={toggleOpen}
        type="ghost"
        size="large"
        icon={<Icon type="Filter" />}
      />
    </Badge>
  );
}
