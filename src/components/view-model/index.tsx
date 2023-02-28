import { Flex } from '@cognite/cogs.js';
import { useQueryClient } from '@tanstack/react-query';
import EntityMatchingResult from 'components/em-result';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import {
  getQMSourceDownloadKey,
  getQMTargetDownloadKey,
  IN_PROGRESS_EM_STATES,
  useCreateEMPredictionJob,
  useEMModel,
  useEMModelPredictResults,
} from 'hooks/contextualization-api';
import { useEffect, useState } from 'react';

export default function ViewModel({}: {}) {
  const queryClient = useQueryClient();
  const { modelId, jobId, setJobId } = useQuickMatchContext();
  const [modelRefetchInt, setModelRefetchInt] = useState<number | undefined>();
  const [predictionRefetchInt, setPredictionRefetchInt] = useState<
    number | undefined
  >();

  const sourceState = queryClient.getQueryState(getQMSourceDownloadKey());
  const targetState = queryClient.getQueryState(getQMTargetDownloadKey());

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
        <QueryStatusIcon status={sourceState?.status} />
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
