import { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Map } from 'immutable';
import merge from 'lodash/merge';

import { ProjectConfig as ProjectConfigTypes } from '@cognite/discover-api-types';

import EmptyState from 'components/emptyState';
import { showErrorMessage } from 'components/toast';
import {
  useProjectConfigGetQuery,
  useProjectConfigUpdateMutate,
  useProjectConfigMetadataGetQuery,
} from 'modules/api/projectConfig/useProjectConfigQuery';

import {
  customConfigComponent,
  customDeleteComponent,
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
      await updateConfig(configChanges);
    } catch (e) {
      showErrorMessage('Could not update config.');
    }
  }, [updateConfig, configChanges, setHasChanges]);

  const handleChange = useCallback((key: string, value: unknown) => {
    setConfigChanges((state) => Map(state).setIn(key.split('.'), value).toJS());
    setHasChanges(true);
  }, []);

  const handleDelete = useCallback(
    async (key: string, value: unknown) => {
      const changes = Map({}).setIn(key.split('.'), value).toJS();
      try {
        await updateConfig(changes);
      } catch (e) {
        showErrorMessage('Could not delete entity.');
      }
    },
    [updateConfig]
  );

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
      onDelete={handleDelete}
      onReset={handleReset}
      hasChanges={hasChanges}
      renderCustomComponent={customConfigComponent}
      renderDeleteComponent={customDeleteComponent}
    />
  );
};
