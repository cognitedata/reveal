import React from 'react';
import { CogniteCapability, SingleCogniteCapability } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import List from 'antd/lib/list';
import CapabilityTag from './CapabilityTag';
import { useTranslation } from 'common/i18n';

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
      <Button type="link" onClick={() => onRemove && onRemove(index)}>
        {t('remove')}
      </Button>
    );

    const editButton = (
      <Button type="link" onClick={() => onEdit && onEdit(index)}>
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
