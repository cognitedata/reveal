import { useEffect, useMemo, useState } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex, Infobox } from '@cognite/cogs.js';
import { Navigate, useParams } from 'react-router-dom';

import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import {
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
  const {
    sourceType,
    allSources,
    sourceFilter,
    sourcesList,
    targetsList,
    matchFields,
    supervisedMode,
    featureType,
    unmatchedOnly,
    allTargets,
    targetFilter,
  } = useQuickMatchContext();
  const [modelRefetchInt, setModelRefetchInt] = useState<number | undefined>();

  const [modelId, setModelId] = useState<number>();
  const [jobId, setJobId] = useState<number>();

  const { mutateAsync: buildModel, isLoading } = useCreateEMModel();

  const advancedFilter = useMemo(
    () => getAdvancedFilter({ api: sourceType, excludeMatched: unmatchedOnly }),
    [unmatchedOnly, sourceType]
  );

  // fetch sources if "select all" option is applied

  const {
    data: sourcePages,
    isFetchingNextPage: isFetchingNextSourcePage,
    fetchNextPage: fetchNextSourcePage,
    hasNextPage: hasNextSourcePage,
    isFetching: isFetchingSource,
    isError: isSourceError,
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

  const sourceStatus = allSources
    ? bulkDownloadStatus({
        isError: isSourceError,
        isFetching: isFetchingSource,
        hasNextPage: hasNextSourcePage,
      })
    : 'success';

  useEffect(() => {
    if (hasNextSourcePage && !isFetchingNextSourcePage) {
      fetchNextSourcePage();
    }
  }, [hasNextSourcePage, isFetchingNextSourcePage, fetchNextSourcePage]);

  const sources = useMemo((): any[] => {
    let stuff: any[] = [];
    sourcePages?.pages?.forEach((i) => {
      stuff = stuff.concat(i.items);
    });
    return stuff;
  }, [sourcePages?.pages]);

  // fetch targets if "select all" option is applied

  const {
    data: targetPages,
    isFetchingNextPage: isFetchingNextTargetPage,
    fetchNextPage: fetchNextTargetPage,
    hasNextPage: hasNextTargetPage,
    isFetching: isFetchingTarget,
    isError: isTargetError,
  } = useInfiniteList(
    sourceType,
    10,
    { advancedFilter, filter: targetFilter, limit: 10000 },
    {
      enabled: allTargets,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const targetStatus = allTargets
    ? bulkDownloadStatus({
        isError: isTargetError,
        isFetching: isFetchingTarget,
        hasNextPage: hasNextTargetPage,
      })
    : 'success';

  useEffect(() => {
    if (hasNextTargetPage && !isFetchingNextTargetPage) {
      fetchNextTargetPage();
    }
  }, [hasNextTargetPage, isFetchingNextTargetPage, fetchNextTargetPage]);

  const targets = useMemo((): any[] => {
    let stuff: any[] = [];
    targetPages?.pages?.forEach((i) => {
      stuff = stuff.concat(i.items);
    });
    return stuff;
  }, [targetPages?.pages]);

  useEffect(() => {
    if (
      !modelId &&
      !isLoading &&
      sourceStatus === 'success' &&
      targetStatus === 'success'
    ) {
      buildModel({
        sourceType,
        sources: allSources ? sources : sourcesList,
        targetsList: allTargets ? targets : targetsList,
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
    setModelId,
    sourcesList,
    supervisedMode,
    allTargets,
    targetsList,
    targets,
    targetStatus,
    sourceStatus,
    sourceType,
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
        {targetStatus && (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={targetStatus} />
            <Body level={2}>{t(`target-data-fetch-${targetStatus}`)}</Body>
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
