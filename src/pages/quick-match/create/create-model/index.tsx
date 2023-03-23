import { useEffect, useMemo, useState } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Flex, Infobox } from '@cognite/cogs.js';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import {
  IN_PROGRESS_EM_STATES,
  useCreateEMModel,
  useCreateEMPredictionJob,
  useEMModel,
  useEMModelPredictResults,
} from 'hooks/contextualization-api';
import { INFINITE_Q_OPTIONS, useInfiniteList } from 'hooks/infiniteList';
import {
  bulkDownloadStatus,
  getAdvancedFilter,
  sessionStorageKey,
} from 'utils';
import QuickMatchTitle from 'components/quick-match-title';
import { useInfinite3dNodes } from 'hooks/threeD';
import { getToken } from '@cognite/cdf-sdk-singleton';

const CreateModel = (): JSX.Element => {
  const {
    subAppPath,
    modelId: modelIdStr,
    jobId: jobIdStr,
  } = useParams<{
    subAppPath: string;
    modelId?: string;
    jobId?: string;
  }>();
  const modelId = !!modelIdStr ? parseInt(modelIdStr, 10) : undefined;
  const jobId = !!jobIdStr ? parseInt(jobIdStr, 10) : undefined;
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    threeDModel,
  } = useQuickMatchContext();
  const [modelRefetchInt, setModelRefetchInt] = useState<number | undefined>();
  const [jobRefetchInt, setJobRefetchInt] = useState<number | undefined>();

  const is3d = sourceType === 'threeD';

  const { data: model } = useEMModel(modelId!, {
    enabled: !!modelId,
    refetchInterval: modelRefetchInt,
    ...INFINITE_Q_OPTIONS, // models and prediction reponses can be _big_
  });
  const token = sessionStorage.getItem(sessionStorageKey(jobId!));
  const { data: prediction } = useEMModelPredictResults(jobId!, token!, {
    enabled: !!jobId,
    refetchInterval: jobRefetchInt,
    ...INFINITE_Q_OPTIONS,
  });

  const {
    mutateAsync: buildModel,
    isLoading,
    isError,
    status: createModelStatus,
  } = useCreateEMModel();

  const advancedFilter = useMemo(
    () => getAdvancedFilter({ api: sourceType, excludeMatched: unmatchedOnly }),
    [unmatchedOnly, sourceType]
  );

  const {
    data: threeDPages,
    isFetchingNextPage: isFetchingNext3DPage,
    fetchNextPage: fetchNext3DPage,
    hasNextPage: hasNext3DPage,
    isFetching: isFetching3D,
    isError: is3DError,
  } = useInfinite3dNodes(
    {
      modelId: threeDModel?.modelId!,
      revisionId: threeDModel?.revisionId!,
    },
    {
      enabled: is3d && !!threeDModel,
      ...INFINITE_Q_OPTIONS,
    }
  );

  // fetch sources if "select all" option is applied
  const {
    data: plainSourcePages,
    isFetchingNextPage: isFetchingNextPlainSourcePage,
    fetchNextPage: fetchNextPlainSourcePage,
    hasNextPage: hasNextPlainSourcePage,
    isFetching: isFetchingPlainSource,
    isError: isPlainSourceError,
  } = useInfiniteList(
    sourceType,
    10,
    { advancedFilter, filter: sourceFilter, limit: 10000 },
    {
      enabled: !is3d && allSources,
      ...INFINITE_Q_OPTIONS,
    }
  );

  const sourcePages = is3d ? threeDPages : plainSourcePages;
  const isFetchingNextSourcePage = is3d
    ? isFetchingNext3DPage
    : isFetchingNextPlainSourcePage;
  const fetchNextSourcePage = is3d ? fetchNext3DPage : fetchNextPlainSourcePage;
  const hasNextSourcePage = is3d ? hasNext3DPage : hasNextPlainSourcePage;
  const isFetchingSource = is3d ? isFetching3D : isFetchingPlainSource;
  const isSourceError = is3d ? is3DError : isPlainSourceError;

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

  const sourcePageFlattened = useMemo((): any[] => {
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
    'assets',
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

  const targetPagesFlattened = useMemo((): any[] => {
    let stuff: any[] = [];
    targetPages?.pages?.forEach((i) => {
      stuff = stuff.concat(i.items);
    });
    return stuff;
  }, [targetPages?.pages]);

  const sources = allSources ? sourcePageFlattened : sourcesList;
  const targets = allTargets ? targetPagesFlattened : targetsList;

  useEffect(() => {
    if (
      !modelId &&
      !isError &&
      !isLoading &&
      sourceStatus === 'success' &&
      targetStatus === 'success' &&
      sources.length > 0 &&
      targets.length > 0
    ) {
      buildModel({
        sourceType,
        sources,
        targets,
        featureType,
        matchFields,
        supervisedMode,
      }).then((model) => {
        navigate(
          createLink(
            `/${subAppPath}/quick-match/create/create-model/${model.id}`
          ),
          { replace: true }
        );
      });
    }
  }, [
    buildModel,
    featureType,
    isError,
    isLoading,
    matchFields,
    modelId,
    navigate,
    sourceStatus,
    sourceType,
    sources,
    subAppPath,
    supervisedMode,
    targetStatus,
    targets,
  ]);

  const { mutate: createPredictJob, status: createPredictStatus } =
    useCreateEMPredictionJob({
      async onSuccess(job) {
        sessionStorage.setItem(
          sessionStorageKey(job.jobId),
          job.jobToken || (await getToken())
        );
        navigate(
          createLink(
            `/${subAppPath}/quick-match/create/create-model/${modelId}/${job.jobId}`
          ),
          { replace: true }
        );
      },
    });

  const modelStatus = model?.status;
  const jobStatus = prediction?.status;

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
    if (modelStatus === 'Completed') {
      createPredictJob(model?.id);
    }
  }, [createPredictJob, model?.id, modelStatus]);

  useEffect(() => {
    if (jobStatus && IN_PROGRESS_EM_STATES.includes(jobStatus)) {
      setJobRefetchInt(1000);
    } else {
      setJobRefetchInt(undefined);
    }
  }, [jobStatus]);

  if (jobStatus === 'Completed') {
    return (
      <Navigate
        to={createLink(
          `/${subAppPath}/quick-match/results/${jobId}/${sourceType}`
        )}
        replace={true}
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
            <Body level={2}>
              {t(`source-data-fetch-${sourceStatus}`)}{' '}
              {sources?.length && `(${sources.length.toLocaleString()})`}
            </Body>
          </Flex>
        )}
        {targetStatus && (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={targetStatus} />
            <Body level={2}>
              {t(`target-data-fetch-${targetStatus}`)}{' '}
              {targets?.length && `(${targets.length.toLocaleString()})`}
            </Body>
          </Flex>
        )}
        {!model ? (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={createModelStatus} />
            <Body level={2}>{t(`create-model-${createModelStatus}`)}</Body>
          </Flex>
        ) : (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={model.status} />
            <Body level={2}>{t(`create-model-${model.status}`)}</Body>
          </Flex>
        )}
        {prediction ? (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={prediction.status} />
            <Body level={2}>
              {t(`create-prediction-job-${prediction.status}`)}
            </Body>
          </Flex>
        ) : (
          <Flex alignItems="center" gap={8}>
            <QueryStatusIcon status={createPredictStatus} />
            <Body level={2}>
              {t(`create-prediction-job-${createPredictStatus}`)}
            </Body>
          </Flex>
        )}
      </Infobox>
    </Flex>
  );
};

export default CreateModel;
