import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { notification } from '@cognite/cdf-utilities';
import { Button, Loader } from '@cognite/cogs.js';
import { CogniteInternalId } from '@cognite/sdk';

import { useTranslation } from '../../../common';
import ErrorPage from '../../../components/error-pages/Error';
import NoAccessPage from '../../../components/error-pages/NoAccess';
import UnknownErrorPage from '../../../components/error-pages/UnknownError';
import Page from '../../../components/page';
import PipelineRunResultsTable from '../../../components/pipeline-run-results-table';
import Step from '../../../components/step';
import {
  useEMPipeline,
  useEMPipelineRun,
} from '../../../hooks/entity-matching-pipelines';
import { useUpdateAssetIds } from '../../../hooks/update';
import { pipelineSourceToAPIType } from '../details/sources';

const PipelineResults = (): JSX.Element => {
  const { t } = useTranslation();

  const { jobId, pipelineId } = useParams<{
    pipelineId: string;
    jobId: string;
  }>();

  const { data: pipeline, error } = useEMPipeline(parseInt(pipelineId ?? ''), {
    enabled: !!pipelineId,
  });

  const { data: emPipelineRun, isInitialLoading } = useEMPipelineRun(
    parseInt(pipelineId ?? ''),
    parseInt(jobId ?? ''),
    {
      enabled: !!pipelineId && !!jobId,
    }
  );

  const [selectedSourceIds, setSelectedSourceIds] = useState<
    CogniteInternalId[]
  >([]);

  const { mutate, isLoading } = useUpdateAssetIds();

  const handleApplySelectedMatches = (): void => {
    if (emPipelineRun && pipeline && selectedSourceIds) {
      const selectedSourceIdSet = new Set();
      selectedSourceIds.forEach((sourceId) => {
        selectedSourceIdSet.add(sourceId);
      });

      const selectedMatches =
        emPipelineRun.matches?.filter(
          ({ source, target }) =>
            typeof source?.id === 'number' &&
            selectedSourceIdSet.has(source.id) &&
            typeof target?.id === 'number'
        ) ?? [];

      mutate(
        {
          api: pipelineSourceToAPIType[pipeline.sources.resource],
          changes: selectedMatches?.map(({ source, target }) => ({
            id: source?.id as number,
            update: {
              assetId: { set: target?.id as number },
            },
          })),
        },
        {
          onSuccess: () => {
            notification.success({
              message: t('notification-success'),
              description: t('save-to-cdf-success'),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t('save-to-cdf-error'),
            });
          },
        }
      );
    }
  };

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  if (isInitialLoading) {
    return (
      <Page subtitle={pipeline?.description} title={pipeline?.name ?? ''}>
        <Step
          title={t('download-result-step-title', { step: 4 })}
          subtitle={t('download-result-step-subtitle')}
        >
          <Loader />
        </Step>
      </Page>
    );
  }

  if (!emPipelineRun) {
    return (
      <ErrorPage
        title={t('pipeline-run-not-found-title')}
        instructions={t('pipeline-run-not-found-instructions')}
      />
    );
  }

  if (pipeline) {
    return (
      <Page
        extraContent={
          <Button
            disabled={selectedSourceIds.length === 0}
            loading={isLoading}
            onClick={handleApplySelectedMatches}
            type="primary"
          >
            {t('apply-selected-matches', { count: selectedSourceIds.length })}
          </Button>
        }
        subtitle={pipeline?.description}
        title={pipeline?.name ?? ''}
      >
        <Step
          title={t('result-step-title', { step: 4 })}
          subtitle={t('result-step-subtitle')}
        >
          <PipelineRunResultsTable
            pipeline={pipeline}
            run={emPipelineRun}
            selectedSourceIds={selectedSourceIds}
            setSelectedSourceIds={setSelectedSourceIds}
          />
        </Step>
      </Page>
    );
  }

  return <></>;
};

export default PipelineResults;
