import React from 'react';
import { Input, Button } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';
import { FormState } from 'CardContainer/CardContainer';
import { StyledClusterSelector } from './elements';

type Props = {
  formState: FormState;
  loading: boolean;
  backToTenantSelector: () => void;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
};

const ClusterSelector = ({
  formState,
  loading,
  backToTenantSelector,
  handleOnChange,
  onSubmit,
}: Props) => {
  const { t } = useTranslation('TenantSelector');

  return (
    <StyledClusterSelector>
      <div className="content">
        <form onSubmit={onSubmit}>
          <div className="cluster-selector_inputs-wrapper">
            <Input
              title={t('company-id_input_title', {
                defaultValue: 'Company ID:',
              })}
              id="tenant"
              name="tenant"
              placeholder={t('company-id_input_placeholder', {
                defaultValue: 'Enter Company ID',
              })}
              value={formState.tenant.value}
              onChange={handleOnChange}
              error={formState.tenant.error}
              disabled={loading}
            />
            <Input
              title={t('project-cluster_input_title', {
                defaultValue: 'Project cluster:',
              })}
              id="cluster"
              name="cluster"
              placeholder={t('project-cluster_input_placeholder', {
                defaultValue: 'Enter Project Cluster',
              })}
              value={formState.cluster.value}
              onChange={handleOnChange}
              error={formState.cluster.error}
              disabled={loading}
            />
          </div>
          <div className="cluster-selector_buttons-wrapper">
            <Button
              variant="ghost"
              iconPlacement="left"
              icon="MicroLeft"
              unstyled
              onClick={backToTenantSelector}
              disabled={loading}
            >
              {t('back_button', { defaultValue: 'Back' })}
            </Button>
            <Button type="primary" loading={loading} onClick={onSubmit}>
              {t('continue_button', { defaultValue: 'Continue' })}
            </Button>
          </div>
        </form>
      </div>
    </StyledClusterSelector>
  );
};

export default ClusterSelector;
