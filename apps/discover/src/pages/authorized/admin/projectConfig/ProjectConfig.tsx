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

import { customConfigComponent } from './configComponents';
import { ProjectConfigForm } from './ProjectConfigForm';
import { ProjectConfigSetupWrapper } from './ProjectConfigSetupWrapper';

export const ProjectConfig = () => {
  const { t } = useTranslation();
  const { data: existingConfig = {}, isLoading } = useProjectConfigGetQuery();

  const { data: metadata, isLoading: isMetadataLoading } =
    useProjectConfigMetadataGetQuery();

  const { mutate: updateConfig, isLoading: isUpdating } =
    useProjectConfigUpdateMutate();

  const [configChanges, setConfigChanges] = useState<ProjectConfigTypes>({});

  const config = useMemo(
    () => merge({}, existingConfig, configChanges),
    [existingConfig, configChanges]
  );

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleUpdate = useCallback(
    async (overridingConfig) => {
      const configToUpdate = overridingConfig ?? configChanges;
      try {
        await updateConfig({ ...configToUpdate, hasCustomConfig: true });
        setConfigChanges({});
        setHasChanges(false);
      } catch (e) {
        showErrorMessage('Could not update config!');
      }
    },
    [updateConfig, configChanges]
  );

  const handleChange = useCallback((key: string, value: unknown) => {
    setConfigChanges((state) => Map(state).setIn(key.split('.'), value).toJS());
    setHasChanges(true);
  }, []);

  const handleReset = useCallback(() => {
    setConfigChanges({});
    setHasChanges(false);
  }, []);

  if (isLoading || isMetadataLoading || isUpdating) {
    return (
      <EmptyState isLoading loadingTitle={t('Loading Project Configuration')} />
    );
  }

  if (!metadata) {
    return (
      <EmptyState isLoading={false} emptyTitle={t('No Metadata Found!')} />
    );
  }

  return (
    <ProjectConfigSetupWrapper
      onChange={handleChange}
      onUpdate={handleUpdate}
      config={config}
    >
      <ProjectConfigForm
        metadata={metadata}
        config={config}
        onChange={handleChange}
        onUpdate={handleUpdate}
        onReset={handleReset}
        hasChanges={hasChanges}
        renderCustomComponent={customConfigComponent}
      />
    </ProjectConfigSetupWrapper>
  );
};
