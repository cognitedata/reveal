import React from 'react';

import { useTranslation } from '@access-management/common/i18n';
import List from 'antd/lib/list';

import { Button } from '@cognite/cogs.js';
import { CogniteCapability, SingleCogniteCapability } from '@cognite/sdk';

import CapabilityTag from './CapabilityTag';

interface CapabilitiesTableProps {
  capabilities: CogniteCapability;
  onEdit?(index: number): void;
  onRemove?(index: number): void;
}

export default function CapabilitiesList(props: CapabilitiesTableProps) {
  const { capabilities, onEdit, onRemove } = props;
  const { t } = useTranslation();

  const renderItem = (capability: SingleCogniteCapability, index: number) => {
    const removeButton = (
      <Button
        type="ghost-accent"
        data-testid="access-management-remove-capability-button"
        onClick={() => onRemove && onRemove(index)}
      >
        {t('remove')}
      </Button>
    );

    const editButton = (
      <Button
        type="ghost-accent"
        data-testid="access-management-edit-capability-button"
        onClick={() => onEdit && onEdit(index)}
      >
        {t('edit')}
      </Button>
    );

    const actions = [] as any[];
    if (onEdit) actions.push(editButton);
    if (onRemove) actions.push(removeButton);

    return (
      <List.Item actions={actions} data-testid="capabilities-list-item">
        <div style={{ width: '100%' }}>
          <CapabilityTag capability={capability} />
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
      locale={{ emptyText: t('capability-not-added') }}
    />
  );
}
