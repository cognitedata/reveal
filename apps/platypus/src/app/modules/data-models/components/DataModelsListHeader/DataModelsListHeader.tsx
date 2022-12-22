import { Flex, Title, Input, Tooltip, Button } from '@cognite/cogs.js';
import config from '@platypus-app/config/config';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useState } from 'react';

export interface DataModelsListHeaderProps {
  dataModelsCount: number;
  onSearchChange: (newSearchText: string) => void;
  onCreateDataModelClick: () => void;
}

export const DataModelsListHeader = (props: DataModelsListHeaderProps) => {
  const { t } = useTranslation('data-models');
  const [searchQuery, setSearchQuery] = useState('');

  const dataModelsWriteAcl = useCapabilities('dataModelsAcl', ['WRITE'], {
    checkAll: true,
  });

  return (
    <Flex justifyContent="space-between" className="header">
      <Title level={3} data-cy="data-models-title">
        {t('data_models_title', 'Data Models')}{' '}
        {props.dataModelsCount ? `(${props.dataModelsCount})` : ''}
      </Title>
      <div style={{ display: 'inline-flex' }}>
        <Input
          iconPlacement="right"
          icon="Search"
          placeholder="Search"
          type="search"
          data-cy="search-data-models"
          value={searchQuery}
          style={{ marginRight: '8px' }}
          onChange={(e) => {
            setSearchQuery(e.currentTarget.value);
            props.onSearchChange(e.currentTarget.value);
          }}
        />
        <Tooltip
          disabled={dataModelsWriteAcl.isAclSupported}
          content={t(
            'create_data_model_btn_disabled_text',
            `Missing "${config.DATA_MODELS_ACL}.write" permission`
          )}
        >
          <Button
            type="primary"
            disabled={!dataModelsWriteAcl.isAclSupported}
            data-cy="create-data-model-btn"
            onClick={props.onCreateDataModelClick}
          >
            {t('create_data_model_btn', 'Create Data Model')}
          </Button>
        </Tooltip>
      </div>
    </Flex>
  );
};
