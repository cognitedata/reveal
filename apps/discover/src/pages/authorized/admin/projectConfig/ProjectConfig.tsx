import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Map } from 'immutable';
import cloneDeep from 'lodash/cloneDeep';

import EmptyState from 'components/emptyState';
import {
  useProjectConfigGetQuery,
  useProjectConfigUpdateMutate,
  useProjectConfigMetadataGetQuery,
} from 'modules/api/projectConfig/useProjectConfigQuery';

import { ProjectConfigForm } from './ProjectConfigForm';
import { Config } from './types';

export const ProjectConfig = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useProjectConfigGetQuery();
  const { data: metadata, isLoading: isMetadataLoading } =
    useProjectConfigMetadataGetQuery();
  const { mutateAsync: updateConfig } = useProjectConfigUpdateMutate();
  const [config, setConfig] = useState<Config>({});

  useEffect(() => {
    setConfig(cloneDeep(data));
  }, [data]);

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleUpdate = useCallback(async () => {
    await updateConfig(config);
  }, [updateConfig, config]);

  const handleChange = useCallback((key: string, value: unknown) => {
    setConfig(
      (state) => Map(state).setIn(key.split('.'), value).toJS() as Config
    );
    setHasChanges(true);
  }, []);

  const handleReset = useCallback(() => {
    setConfig(data);
    setHasChanges(false);
  }, [data]);

  if (isLoading || isMetadataLoading) {
    return (
      <EmptyState isLoading loadingTitle={t('Loading Project Configuration')} />
    );
  }

  return (
    <ProjectConfigForm
      metadata={metadata}
      config={config}
      onChange={handleChange}
      onUpdate={handleUpdate}
      onReset={handleReset}
      hasChanges={hasChanges}
    />
  );
};
