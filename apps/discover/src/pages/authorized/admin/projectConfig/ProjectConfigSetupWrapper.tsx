import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import omit from 'lodash/omit';
import pick from 'lodash/pick';

import { Checkbox, Label, Flex } from '@cognite/cogs.js';
import {
  ProjectConfigGeneral,
  ProjectConfig,
} from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import EmptyState from 'components/emptyState';
import { OKModal } from 'components/modal';
import { fetchTenantFile } from 'hooks/useTenantConfig';
import { TenantConfig, Layers } from 'tenants/types';

import { FullContainer, PaddingBottomBorder } from './elements';
import { HandleConfigChange, HandleConfigUpdate } from './types';

const generalConfigKeys: Array<keyof ProjectConfigGeneral> = [
  'sideBar',
  'searchableLayerTitle',
  'showProjectConfig',
  'showDynamicResultCount',
  'hideFilterCount',
  'companyInfo',
];

const adaptConfigForBackend = (
  config?: TenantConfig,
  layers?: Layers
): ProjectConfig => {
  const newConfig = {
    ...omit(config, generalConfigKeys),
    general: pick(config, generalConfigKeys),
    map: {
      ...config?.map,
      layers: Object.values(layers || {}),
    },
  };

  return newConfig as ProjectConfig;
};

export const ProjectConfigSetupWrapper: React.FC<{
  config: ProjectConfig;
  onChange: HandleConfigChange;
  onUpdate: HandleConfigUpdate;
}> = ({ children, config, onUpdate }) => {
  const [tenant] = getTenantInfo();
  const { t } = useTranslation();

  const [enableCustomConfig, setEnableCustomConfig] = useState(
    Boolean(config.hasCustomConfig)
  );

  const [configInfo, setConfigInfo] = useState<{
    loading: boolean;
    hasLocalConfig: boolean;
    config?: TenantConfig;
    layers?: Layers;
  }>({
    loading: true,
    hasLocalConfig: false,
  });

  useEffect(() => {
    const hasConfigFiles = async () => {
      try {
        const config = await fetchTenantFile(tenant, 'config');
        const layers = await fetchTenantFile(tenant, 'layers');
        setConfigInfo({
          loading: false,
          hasLocalConfig: Boolean(config || layers),
          config,
          layers,
        });
      } catch (_) {
        setConfigInfo({
          loading: false,
          hasLocalConfig: false,
        });
      }
    };
    hasConfigFiles();
  }, [tenant]);

  if (configInfo.loading) {
    return (
      <EmptyState isLoading loadingTitle={t('Checking for existing config!')} />
    );
  }

  if (config.hasCustomConfig) {
    return <FullContainer>{children}</FullContainer>;
  }

  if (configInfo.hasLocalConfig) {
    return (
      <OKModal
        testId="project-config-setup-modal"
        closable={false}
        halfWidth
        visible
        title={t('Project Config Setup')}
        okText={t('Save')}
        onOk={() => {
          onUpdate(adaptConfigForBackend(configInfo.config, configInfo.layers));
        }}
      >
        {t(
          'In order to use project config, please click save to save your existing config once.'
        )}
      </OKModal>
    );
  }

  return (
    <FullContainer direction="column">
      <PaddingBottomBorder>
        <Flex direction="column" gap={16}>
          <Label icon="Info">
            {t(
              'You have default project configuration set. In order to customize, please enable custom config.'
            )}
          </Label>
          <Checkbox
            name="hasCustomConfig"
            checked={enableCustomConfig}
            onChange={(nextState) => {
              setEnableCustomConfig(nextState);
            }}
          >
            {t('Enable Custom Config')}
          </Checkbox>
        </Flex>
      </PaddingBottomBorder>
      {enableCustomConfig ? children : null}
    </FullContainer>
  );
};
