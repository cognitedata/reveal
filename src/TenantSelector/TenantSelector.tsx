import React from 'react';
import { Button, Input } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';

import { StyledSpecifyCluster } from './elements';

type Props = {
  tenant: string;
  loading: boolean;
  errorList: React.ReactNode;
  tenantError?: string;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  setClusterSelectorShown: (clusterSelectorShown: boolean) => void;
};

const TenantSelector = ({
  tenant,
  handleOnChange,
  onSubmit,
  loading,
  setClusterSelectorShown,
  tenantError,
  errorList,
}: Props) => {
  const { t } = useTranslation('TenantSelector');

  return (
    <>
      <div className="content">
        <form onSubmit={onSubmit}>
          <div className="tenant-selector__company-item">
            <Input
              autoFocus
              title={t('company-id_input_title', {
                defaultValue: 'Company ID:',
              })}
              id="tenant"
              name="tenant"
              placeholder={t('company-id_input_placeholder', {
                defaultValue: 'Enter Company ID',
              })}
              value={tenant}
              onChange={handleOnChange}
              error={tenantError}
              disabled={loading}
            />
          </div>

          <Button type="primary" onClick={onSubmit} loading={loading}>
            {t('continue_button', { defaultValue: 'Continue' })}
          </Button>
        </form>
      </div>
      {errorList}
      <StyledSpecifyCluster>
        <Button
          variant="ghost"
          iconPlacement="right"
          icon="MicroRight"
          unstyled
          disabled={loading}
          onClick={() => {
            setClusterSelectorShown(true);
          }}
        >
          {t('specify-cluster_button', { defaultValue: 'Specify cluster' })}
        </Button>
      </StyledSpecifyCluster>
    </>
  );
};

export default TenantSelector;
