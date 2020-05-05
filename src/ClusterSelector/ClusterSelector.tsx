import React from 'react';
import { Input, Button } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';
import { FormState } from 'CardContainer/CardContainer';
import { StyledClusterSelector } from './elements';

type Props = {
  setClusterSelectorShown: (clusterSelectorShown: boolean) => void;
  formState: FormState;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ClusterSelector = ({
  setClusterSelectorShown,
  formState,
  handleOnChange,
}: Props) => {
  const { t } = useTranslation('TenantSelector');

  const handleOnReturnClick = () => {
    setClusterSelectorShown(false);
  };

  return (
    <StyledClusterSelector>
      <div className="content">
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
          />
        </div>
        <div className="cluster-selector_buttons-wrapper">
          <Button
            variant="ghost"
            iconPlacement="left"
            icon="MicroLeft"
            unstyled
            onClick={handleOnReturnClick}
          >
            {t('back_button', { defaultValue: 'Back' })}
          </Button>
          <Button type="primary">
            {t('continue_button', { defaultValue: 'Continue' })}
          </Button>
        </div>
      </div>
    </StyledClusterSelector>
  );
};

export default ClusterSelector;
