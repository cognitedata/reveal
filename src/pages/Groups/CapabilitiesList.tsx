import React, { ReactNode } from 'react';
import { Tag } from 'antd';
import { CogniteCapability, SingleCogniteCapability } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import List from 'antd/lib/list';
import { getReadableCapabilitiesWithScope } from './utils';

interface CapabilitiesTableProps {
  capabilities: CogniteCapability;
  onEdit?(index: number): void;
  onRemove?(index: number): void;
}

interface ReadableCapability {
  key: string;
  label: ReactNode;
}

export const EMPTY_MESSAGE = 'No capability was added yet';

export default function CapabilitiesList(props: CapabilitiesTableProps) {
  const { capabilities, onEdit, onRemove } = props;

  const renderItem = (capability: SingleCogniteCapability, index: number) => {
    const removeButton = (
      <Button type="link" onClick={() => onRemove && onRemove(index)}>
        Remove
      </Button>
    );

    const editButton = (
      <Button type="link" onClick={() => onEdit && onEdit(index)}>
        Edit
      </Button>
    );

    const actions = [] as any[];
    if (onEdit) actions.push(editButton);
    if (onRemove) actions.push(removeButton);

    const capabilityList = getReadableCapabilitiesWithScope([capability]);

    return (
      <List.Item actions={actions} data-testid="capabilities-list-item">
        <div style={{ width: '100%' }}>
          {capabilityList.map((readableCapability: ReadableCapability) => (
            <Tag key={readableCapability.key.toString()}>
              {readableCapability.label}
            </Tag>
          ))}
        </div>
      </List.Item>
    );
  };

  return (
    <List
      dataSource={capabilities}
      renderItem={renderItem}
      bordered
      size="small"
      locale={{ emptyText: EMPTY_MESSAGE }}
    />
  );
}
