import { Flex, Title, Input, Tooltip, Button } from '@cognite/cogs.js';

import config from '../../../../config/config';
import { useCapabilities } from '../../../../hooks/useCapabilities';
import { useTranslation } from '../../../../hooks/useTranslation';

export interface DataModelsListHeaderProps {
  dataModelsCount: number;
  onSearchChange: (newSearchText: string) => void;
  onCreateDataModelClick: () => void;
  searchText: string;
}

export const DataModelsListHeader = (props: DataModelsListHeaderProps) => {
  const { t } = useTranslation('data-models');

  const dataModelsWriteAcl = useCapabilities('dataModelsAcl', ['WRITE'], {
    checkAll: false,
  });

  return (
    <Flex justifyContent="space-between" className="header">
      <Title level={3} data-cy="data-models-title">
        {t('data_models_title', 'Data Models')}
        {` (${props.dataModelsCount})`}
      </Title>
      <div style={{ display: 'inline-flex' }}>
        <Input
          iconPlacement="right"
          icon="Search"
          placeholder="Search"
          type="search"
          data-cy="search-data-models"
          value={props.searchText}
          style={{ marginRight: '8px' }}
          onChange={(e) => {
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
