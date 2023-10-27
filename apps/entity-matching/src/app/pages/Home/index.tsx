import { useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { createLink, notification } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { SOURCE_TABLE_QUERY_KEY } from '../../common/constants';
import { CreatePipelineButton } from '../../components/create-pipeline-button/CreatePipelineButton';
import NoAccessPage from '../../components/error-pages/NoAccess';
import UnknownErrorPage from '../../components/error-pages/UnknownError';
import NoWrapButton from '../../components/no-wrap-button';
import { PipelineList } from '../../components/pipeline-list';
import SearchInput from '../../components/search-input';
import Title from '../../components/title';
import {
  Pipeline,
  useDeleteEMPipeline,
  useDuplicateEMPipeline,
  useEMPipelines,
  useRunEMPipeline,
} from '../../hooks/entity-matching-pipelines';
import { collectPages } from '../../utils/collectPages';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams('');
  const { error } = useEMPipelines();
  const { data, isInitialLoading } = useEMPipelines();
  const { mutateAsync: runEMPipeline } = useRunEMPipeline();
  const { mutate: duplicatePipeline } = useDuplicateEMPipeline();
  const { mutate: deletePipeline } = useDeleteEMPipeline();

  const pipelineList: Pipeline[] = collectPages(data);

  const handleReRunPipeline = (id: number) => {
    runEMPipeline({ id });
  };

  const handleDuplicate = useCallback(
    (pipeline: Pipeline) => {
      duplicatePipeline(
        {
          id: pipeline.id,
          name: pipeline.name,
          description: pipeline.description,
          sources: pipeline.sources,
          targets: pipeline.targets,
        },
        {
          onSuccess: (_: unknown, { name: pipelineName }) => {
            notification.success({
              message: t('notification-success'),
              description: t('pipeline-notification-duplicate-success', {
                name: pipelineName,
              }),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t('pipeline-notification-duplicate-error'),
            });
          },
        }
      );
    },
    [duplicatePipeline, t]
  );

  const handleDeletePipeline = useCallback(
    (id: number) => {
      deletePipeline(
        { ids: [id] },
        {
          onSuccess: () => {
            notification.success({
              message: t('notification-success'),
              description: t('pipeline-notification-delete-success', {
                id,
              }),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t('pipeline-notification-delete-error'),
            });
          },
        }
      );
    },
    [deletePipeline, t]
  );

  if (error) {
    if (error?.status === 403) {
      return (
        <ListWrapper>
          <Title
            title={t('entity-matching-pipelines')}
            dataTestId="home-title"
          />
          <NoAccessPage />
        </ListWrapper>
      );
    }
    return <UnknownErrorPage error={error} />;
  }

  return (
    <ListWrapper>
      <Title title={t('entity-matching-pipelines')} dataTestId="home-title" />
      <TopRow
        gap={22}
        alignItems="center"
        justifyContent="space-between"
        data-testid="top-row"
      >
        <SearchInput
          placeholder={t('filter-placeholder')}
          onChange={(e) => {
            searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
            setSearchParams(searchParams);
          }}
          value={searchParams.get(SOURCE_TABLE_QUERY_KEY) || ''}
        />
        <Flex gap={12}>
          <Link
            to={createLink(`/${subAppPath}/quick-match/create/select-sources`)}
            data-testid="quick-match-button"
          >
            <NoWrapButton type="primary" icon="GanttChart">
              {t('quick-match')}
            </NoWrapButton>
          </Link>
          <CreatePipelineButton dataTestId="create-pipeline-button" />
        </Flex>
      </TopRow>
      <PipelineList
        isLoading={isInitialLoading}
        pipelineList={pipelineList}
        handleReRunPipeline={handleReRunPipeline}
        handleDuplicate={handleDuplicate}
        handleDeletePipeline={handleDeletePipeline}
      />
    </ListWrapper>
  );
}

const TopRow = styled(Flex)`
  margin-top: 40px;
`;

const ListWrapper = styled(Flex).attrs({ direction: 'column' })`
  padding: 24px 40px;
`;
