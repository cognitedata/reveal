import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Map } from 'immutable';
import cloneDeep from 'lodash/cloneDeep';

import { Button, Title } from '@cognite/cogs.js';

import EmptyState from 'components/emptyState';
import { SearchBox } from 'components/filters';
import {
  useProjectConfigGetQuery,
  useProjectConfigUpdateMutate,
} from 'modules/api/projectConfig/useProjectConfigQuery';

import { ProjectConfigContainer, ProjectConfigFooter } from './elements';
import { ProjectConfigForm } from './ProjectConfigForm';
import { Config } from './types';

export const ProjectConfig = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useProjectConfigGetQuery();
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

  const [searchText, handleSearch] = useState<string>('');

  const handleReset = useCallback(() => {
    setConfig(data);
    setHasChanges(false);
  }, [data]);

  if (isLoading) {
    return (
      <EmptyState
        isLoading={isLoading}
        loadingTitle={t('Loading Project Configuration')}
      />
    );
  }

  return (
    <ProjectConfigContainer direction="column" gap={16}>
      <Title level={3}>{t('Project Configuration')}</Title>
      <SearchBox
        placeholder={t('Search')}
        onSearch={handleSearch}
        value={searchText}
      />
      <ProjectConfigForm config={config} onChange={handleChange} />
      <ProjectConfigFooter gap={8} justifyContent="end">
        <Button type="secondary" disabled={!hasChanges} onClick={handleReset}>
          {t('Revert')}
        </Button>
        <Button type="primary" onClick={handleUpdate}>
          {t('Update')}
        </Button>
      </ProjectConfigFooter>
    </ProjectConfigContainer>
  );
};
