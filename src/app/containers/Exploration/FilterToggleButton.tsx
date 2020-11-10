import React from 'react';
import { Badge, Button } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { isEmpty } from 'lodash';
import { useResourceFilter } from 'app/context/ResourceSelectionContext';
import { useCurrentResourceType } from './hooks';

export default function FilterToggleButton({
  toggleOpen,
}: {
  toggleOpen: () => void;
}) {
  const [resourceType] = useCurrentResourceType();
  const filter = useResourceFilter(resourceType);
  const count = filter
    ? Object.values(filter).filter(f => !!f && !isEmpty(f)).length
    : 0;
  return (
    <Badge count={count} style={{ zIndex: 2 }}>
      <Button
        onClick={toggleOpen}
        type="ghost"
        size="large"
        icon={<Icon type="Filter" />}
      />
    </Badge>
  );
}
