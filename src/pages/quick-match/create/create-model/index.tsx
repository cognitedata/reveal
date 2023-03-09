import { useEffect, useMemo, useState } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex, Infobox } from '@cognite/cogs.js';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';

import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import {
  getQMTargetDownloadKey,
  IN_PROGRESS_EM_STATES,
  useCreateEMModel,
  useCreateEMPredictionJob,
  useEMModel,
} from 'hooks/contextualization-api';
import { useInfiniteList } from 'hooks/infiniteList';
import { bulkDownloadStatus, getAdvancedFilter } from 'utils';
import QuickMatchTitle from 'components/quick-match-title';

const CreateModel = (): JSX.Element => {
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    sourceType,
    allSources,
    sourceFilter,
    sourcesList,
    targetsList,
    matchFields,
    supervisedMode,
    featureType,
    scope,
    unmatchedOnly,
  } = useQuickMatchContext();
  const [modelRefetchInt, setModelRefetchInt] = useState<number | undefined>();

  const [modelId, setModelId] = useState<number>();
  const [jobId, setJobId] = useState<number>();

  const { mutateAsync: buildModel, isLoading } = useCreateEMModel();

  const targetState = queryClient.getQueryState(getQMTargetDownloadKey());

  const advancedFilter = useMemo(
    () => getAdvancedFilter({ sourceType, excludeMatched: unmatchedOnly }),
    [unmatchedOnly, sourceType]
  );

  const {
    data: sourcePages,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching: sourceFetching,
    isError: sourceError,
    isFetched,
  } = useInfiniteList(
    sourceType,
    10,
    { advancedFilter, filter: sourceFilter, limit: 10000 },
    {
      enabled: allSources,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const sourceStatus = bulkDownloadStatus({
    isError: sourceError,
    isFetching: sourceFetching,
    hasNextPage,
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sources = useMemo((): any[] => {
    let stuff: any[] = [];
    sourcePages?.pages?.forEach((i) => {
      stuff = stuff.concat(i.items);
    });
    return stuff;
  }, [sourcePages?.pages]);

  useEffect(() => {
    if (!modelId && !isLoading && !hasNextPage && isFetched) {
      buildModel({
        sources,
        targetsList,
        featureType,
        matchFields,
        supervisedMode,
      }).then((model) => {
        setModelId(model.id);
      });
    }
  }, [
    sources,
    modelId,
    isLoading,
    allSources,
    buildModel,
    featureType,
    matchFields,
    scope,
    setModelId,
    sourceFilter,
    sourcesList,
    supervisedMode,
    targetsList,
    hasNextPage,
    isFetched,
  ]);

  const { data: model, status: createModelStatus } = useEMModel(modelId!, {
    enabled: !!modelId,
    refetchInterval: modelRefetchInt,
  });

  const { mutate: createPredictJob, status: createPredictStatus } =
    useCreateEMPredictionJob({
      onSuccess(job) {
        setJobId(job.jobId);
      },
    });

  const modelStatus = model?.status.toLowerCase();

  useEffect(() => {
    if (!modelStatus) {
      return;
    }
    if (IN_PROGRESS_EM_STATES.includes(modelStatus)) {
      setModelRefetchInt(1000);
    } else {
      setModelRefetchInt(undefined);
    }
  }, [modelStatus, modelRefetchInt]);

  useEffect(() => {
    if (!modelStatus || !model?.id) {
      return;
    }
    if (!IN_PROGRESS_EM_STATES.includes(modelStatus)) {
      createPredictJob(model?.id);
    }
  }, [createPredictJob, model?.id, modelStatus]);

  if (createPredictStatus === 'success') {
    return (
      <Navigate
        replace
        to={createLink(`/${subAppPath}/quick-match/results/${jobId}`)}
      />
    );
  }

  return (
    <Flex direction="column" gap={8}>
      <QuickMatchTitle step="create-model" />
      <Infobox type="neutral" title={t('do-not-leave-the-page-quick-match')}>
        {sourceStatus && (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={sourceStatus} />
            <Body level={2}>{t(`source-data-fetch-${sourceStatus}`)}</Body>
          </Flex>
        )}
        {targetState?.status && (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={targetState?.status} />
            <Body level={2}>
              {t(`target-data-fetch-${targetState?.status}`)}
            </Body>
          </Flex>
        )}
        <Flex alignItems="center" gap={8}>
          <QueryStatusIcon status={createModelStatus} />
          <Body level={2}>{t(`create-model-${createModelStatus}`)}</Body>
        </Flex>
        <Flex alignItems="center" gap={8}>
          <QueryStatusIcon status={createPredictStatus} />
          <Body level={2}>
            {t(`create-prediction-job-${createPredictStatus}`)}
          </Body>
        </Flex>
      </Infobox>
    </Flex>
  );
};

export default CreateModel;
