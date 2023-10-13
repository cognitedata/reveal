import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Col, Flex, Infobox, Row } from '@cognite/cogs.js';

import { useTranslation } from '../../../../common';
import QueryStatusProgress, {
  percentFromStatus,
} from '../../../../components/QueryStatusProgress';
import Step from '../../../../components/step';
import { useQuickMatchContext } from '../../../../context/QuickMatchContext';
import {
  useCreateEMModel,
  useEMModel,
} from '../../../../hooks/entity-matching-models';
import {
  useCreateEMPredictionJob,
  useEMModelPredictResults,
} from '../../../../hooks/entity-matching-predictions';
import {
  INFINITE_Q_OPTIONS,
  useInfiniteList,
} from '../../../../hooks/infiniteList';
import { useInfinite3dNodes } from '../../../../hooks/threeD';
import { IN_PROGRESS_EM_STATES } from '../../../../hooks/types';
import {
  bulkDownloadStatus,
  getAdvancedFilter,
  sessionStorage3dDetailsKey,
  sessionStoragePredictJobKey,
} from '../../../../utils';
const Circle = styled.div`
  border: 1px solid #000000d9;
  border-radius: 50%;
  width: 2em;
  height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.3em;
`;

const CreateModel = (): JSX.Element => {
  const {
    subAppPath,
    modelId: modelIdStr,
    predictJobId: predictJobIdStr,
  } = useParams<{
    subAppPath: string;
    modelId?: string;
    predictJobId?: string;
  }>();
  const modelId = modelIdStr ? parseInt(modelIdStr, 10) : undefined;
  const predictJobId = predictJobIdStr
    ? parseInt(predictJobIdStr, 10)
    : undefined;
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
  const [modelRefetchInterval, setModelRefetchInterval] = useState<
    number | undefined
  >();
  const [predictRefetchInterval, setPredictRefetchInterval] = useState<
    number | undefined
  >();

  const is3d = sourceType === 'threeD';

  const predictJobToken = sessionStorage.getItem(
    sessionStoragePredictJobKey(predictJobId!)
  );

  const { data: model } = useEMModel(modelId!, {
    enabled: !!modelId,
    refetchInterval: modelRefetchInterval,
    ...INFINITE_Q_OPTIONS, // models and prediction reponses can be _big_
  });

  const { data: prediction } = useEMModelPredictResults(
    predictJobId!,
    predictJobToken,
    {
      enabled: !!predictJobId,
      refetchInterval: predictRefetchInterval,
      ...INFINITE_Q_OPTIONS,
    }
  );

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
      // eslint-disable-next-line
      modelId: threeDModel?.modelId!,
      // eslint-disable-next-line
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
      }).then((newModel: any) => {
        navigate(
          createLink(
            `/${subAppPath}/quick-match/create/create-model/${newModel.id}`
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
        if (job.jobToken) {
          sessionStorage.setItem(
            sessionStoragePredictJobKey(job.jobId),
            job.jobToken
          );
        }
        if (is3d) {
          sessionStorage.setItem(
            sessionStorage3dDetailsKey(job.jobId),
            JSON.stringify(threeDModel)
          );
        }

        navigate(
          createLink(
            `/${subAppPath}/quick-match/create/create-model/${modelId}/${job.jobId}`
          ),
          { replace: true }
        );
      },
    });

  useEffect(() => {
    if (!model?.status) {
      return;
    }
    if (IN_PROGRESS_EM_STATES.includes(model?.status)) {
      setModelRefetchInterval(1000);
    } else {
      setModelRefetchInterval(undefined);
    }
  }, [model?.status, modelRefetchInterval]);

  useEffect(() => {
    if (!model?.status || !model?.id) {
      return;
    }
    if (model?.status === 'Completed') {
      createPredictJob(model?.id);
    }
  }, [createPredictJob, model?.id, model?.status]);

  useEffect(() => {
    if (
      prediction?.status &&
      IN_PROGRESS_EM_STATES.includes(prediction?.status)
    ) {
      setPredictRefetchInterval(1000);
    } else {
      setPredictRefetchInterval(undefined);
    }
  }, [prediction?.status]);

  if (prediction?.status === 'Completed') {
    return (
      <Navigate
        to={createLink(
          `/${subAppPath}/quick-match/results/${modelId}/${predictJobId}/${sourceType}`
        )}
        replace={true}
      />
    );
  }

  return (
    <Step isCentered dataTestId="create-model-step">
      <Flex direction="column" gap={8}>
        <Infobox type="neutral" title={t('do-not-leave-the-page-quick-match')}>
          {sourceStatus && (
            <Row cols={20}>
              <Col span={1}>
                <Circle>1</Circle>
              </Col>
              <Col span={19}>
                <Body level={2}>
                  {t(`source-data-fetch-${sourceStatus}`)}{' '}
                  {sources?.length && `(${sources.length.toLocaleString()})`}
                </Body>
                <QueryStatusProgress status={sourceStatus} />
              </Col>
            </Row>
          )}
          {targetStatus && (
            <Row cols={20}>
              <Col span={1}>
                <Circle>2</Circle>
              </Col>
              <Col span={19}>
                <Body level={2}>
                  {t(`target-data-fetch-${targetStatus}`)}{' '}
                  {targets?.length && `(${targets.length.toLocaleString()})`}
                </Body>
                <QueryStatusProgress status={targetStatus} />
              </Col>
            </Row>
          )}
          <Row cols={20}>
            <Col span={1}>
              <Circle>3</Circle>
            </Col>
            <Col span={19}>
              {!model ? (
                <Body level={2}>{t(`create-model-${createModelStatus}`)}</Body>
              ) : (
                <Body level={2}>{t(`create-model-${model.status}`)}</Body>
              )}
              <QueryStatusProgress
                percent={
                  (percentFromStatus(createModelStatus) +
                    percentFromStatus(model?.status)) /
                  2
                }
              />
            </Col>
          </Row>
          <Row cols={20}>
            <Col span={1}>
              <Circle>4</Circle>
            </Col>
            <Col span={19}>
              {!prediction ? (
                <Body level={2}>
                  {t(`create-prediction-job-${createPredictStatus}`)}
                </Body>
              ) : (
                <Body level={2}>
                  {t(`create-prediction-job-${prediction.status}`)}
                </Body>
              )}
              <QueryStatusProgress
                percent={
                  (percentFromStatus(createPredictStatus) +
                    percentFromStatus(prediction?.status)) /
                  2
                }
              />
            </Col>
          </Row>
        </Infobox>
      </Flex>
    </Step>
  );
};

export default CreateModel;
