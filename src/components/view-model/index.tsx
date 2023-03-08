import { Flex } from '@cognite/cogs.js';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'common';
import EntityMatchingResult from 'components/em-result';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import {
  getQMTargetDownloadKey,
  IN_PROGRESS_EM_STATES,
  useCreateEMModel,
  useCreateEMPredictionJob,
  useEMModel,
  useEMModelPredictResults,
} from 'hooks/contextualization-api';
import { useInfiniteList } from 'hooks/infiniteList';

import { useEffect, useMemo, useState } from 'react';
import { bulkDownloadStatus, getAdvancedFilter } from 'utils';

export default function ViewModel({}: {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    sourceType,
    modelId,
    setModelId,
    jobId,
    setJobId,
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
  const [predictionRefetchInt, setPredictionRefetchInt] = useState<
    number | undefined
  >();

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

  const { data: predictions, status: predictResultStatus } =
    useEMModelPredictResults(jobId!, {
      enabled: !!jobId,
      refetchInterval: predictionRefetchInt,
    });

  const predictStatus = predictions?.status.toLowerCase();

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

  useEffect(() => {
    if (!predictStatus) {
      return;
    }
    if (IN_PROGRESS_EM_STATES.includes(predictStatus)) {
      setPredictionRefetchInt(1000);
    } else {
      setPredictionRefetchInt(undefined);
    }
  }, [predictStatus, predictionRefetchInt]);

  return (
    <Flex direction="column">
      <Flex gap={12}>
        <>{t('sources', { count: sources?.length || 0 })}</>
        <QueryStatusIcon status={sourceStatus} />)
        <QueryStatusIcon status={targetState?.status} />
        <QueryStatusIcon status={createModelStatus} />
        <QueryStatusIcon status={createPredictStatus} />
        <QueryStatusIcon status={predictResultStatus} />
      </Flex>
      {predictions?.status === 'Completed' && !!predictions?.items && (
        <EntityMatchingResult predictions={predictions.items} />
      )}
    </Flex>
  );
}
