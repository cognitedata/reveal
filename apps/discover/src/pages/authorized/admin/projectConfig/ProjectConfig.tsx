import { useProjectConfigUpdateMutate } from 'domain/projectConfig/internal/actions/useProjectConfigUpdateMutate';
import { useProjectConfigGetQuery } from 'domain/projectConfig/internal/queries/useProjectConfigGetQuery';
import { useProjectConfigMetadataGetQuery } from 'domain/projectConfig/internal/queries/useProjectConfigMetadataGetQuery';

import { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Map } from 'immutable';
import merge from 'lodash/merge';

import { ProjectConfig as ProjectConfigTypes } from '@cognite/discover-api-types';

import EmptyState from 'components/EmptyState';
import { showErrorMessage } from 'components/Toast';

import {
  CustomConfigComponent,
  CustomDeleteComponent,
} from '../configComponents';

import { ProjectConfigForm } from './ProjectConfigForm';

export const ProjectConfig = () => {
  const { t } = useTranslation();

  const { data: existingConfig = {}, isLoading } = useProjectConfigGetQuery();

  const { data: metadata, isLoading: isMetadataLoading } =
    useProjectConfigMetadataGetQuery();

  const [configChanges, setConfigChanges] = useState<ProjectConfigTypes>({});

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setConfigChanges({});
    setHasChanges(false);
  }, []);

  const config = useMemo(
    () => merge({}, existingConfig, configChanges),
    [existingConfig, configChanges]
  );

  const { mutate: updateConfig } = useProjectConfigUpdateMutate({
    onSuccess: handleReset,
    onError: () => {
      showErrorMessage('Could not update project configuration.');
      setHasChanges(true);
    },
  });

  const handleUpdate = useCallback(async () => {
    setHasChanges(false);
    try {
      return updateConfig(configChanges);
    } catch (e) {
      showErrorMessage('Could not update config.');
      return Promise.reject(new Error('Could not update config.'));
    }
  }, [updateConfig, configChanges, setHasChanges]);

  const handleChange = useCallback((key: string, value: unknown) => {
    setConfigChanges((state) => Map(state).setIn(key.split('.'), value).toJS());
    setHasChanges(true);
  }, []);

  if (isLoading || isMetadataLoading) {
    return (
      <EmptyState isLoading loadingTitle={t('Loading project configuration')} />
    );
  }

  if (!metadata) {
    return (
      <EmptyState isLoading={false} emptyTitle={t('No Metadata Found.')} />
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
      renderCustomComponent={CustomConfigComponent}
      renderDeleteComponent={CustomDeleteComponent}
    />
  );
};
