import { Flex } from '@cognite/cogs.js';
import { useQueryClient } from '@tanstack/react-query';
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
import { useList } from 'hooks/list';
import { RawTimeseries } from 'hooks/timeseries';
import { useEffect, useMemo, useState } from 'react';
import { bulkDownloadStatus } from 'utils';

export default function ViewModel({}: {}) {
  const queryClient = useQueryClient();
  const {
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
    () =>
      unmatchedOnly
        ? {
            not: {
              exists: {
                property: ['assetId'],
              },
            },
          }
        : undefined,
    [unmatchedOnly]
  );

  const {
    data: sourcePages,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetching: sourceFetching,
    isError: sourceError,
  } = useList(
    'timeseries',
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

  const sources = useMemo((): RawTimeseries[] => {
    const start: RawTimeseries[] = [];
    const foo = sourcePages?.pages.reduce((accl, p): RawTimeseries[] => {
      return [...accl, ...p.items];
    }, start);
    return foo || start;
  }, [sourcePages]);

  useEffect(() => {
    if (!modelId && !isLoading) {
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
        <>(Sources: {sources?.length}</>
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
