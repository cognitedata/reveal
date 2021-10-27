import { useContext, MouseEvent } from 'react';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { selectSimulators } from 'store/simulator/selectors';
import { selectEventById } from 'store/event/selectors';
import {
  fetchLatestEventByCalculationId,
  runNewCalculation,
} from 'store/event/thunks';
import { usePolling } from 'hooks/usePolling';
import { CapitalizedLabel } from 'pages/elements';

import { RunCalculationButton } from './elements';
import { EVENT_CONSTANTS, POLLING_TIME, STATUS_TYPE } from './constants';

interface ComponentProps {
  data: FileInfoSerializable;
}
export default function StatusCell({ data }: ComponentProps) {
  const { cdfClient, authState } = useContext(CdfClientContext);
  const dispatch = useAppDispatch();
  const simulators = useAppSelector(selectSimulators);
  const selectedEvent = useAppSelector(selectEventById(data.externalId || ''));
  const status = selectedEvent?.metadata?.status || 'none';
  const isCalculationRunning = ['running'].includes(status);
  const isCalculationReadyOrRunning = ['ready', 'running'].includes(status);
  const pollingTime = isCalculationRunning
    ? POLLING_TIME.SHORT
    : POLLING_TIME.LONG;

  const getStatus = async () => {
    if (!data.externalId || !data.source) {
      return;
    }
    const filter = {
      source: data.source,
      type: EVENT_CONSTANTS.SIM_CALC,
      metadata: {
        calcConfig: data.externalId, // Calc. config externalId
      },
    };

    await dispatch(
      fetchLatestEventByCalculationId({ client: cdfClient, filter })
    );
  };
  usePolling(getStatus, pollingTime, true);

  const onClickRun = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const { metadata, source, dataSetId, externalId } = data;
    if (!metadata || !source || !dataSetId || !externalId) {
      throw new Error('Insufficient calculation data');
    }
    const { calcName, modelName, calcType } = metadata;
    if (!calcName || !modelName || !calcType) {
      throw new Error('Insufficient calculation metadata');
    }
    if (!authState?.email) {
      throw new Error('No logged in user data');
    }
    const item = {
      externalId: `${source}-SR-${calcType}-${modelName}-${new Date().getTime()}`,
      dataSetId: 2858799267182482,
      type: EVENT_CONSTANTS.SIM_CALC,
      subtype: calcName,
      metadata: {
        connector: simulators[0].name || '',
        dataType: EVENT_CONSTANTS.SIM_CALC,
        runType: EVENT_CONSTANTS.MANUAL,
        status: 'ready',
        description: EVENT_CONSTANTS.PROSPER_SIM_EVENT,
        modelName,
        simulator: source,
        calcType,
        calcName,
        calcConfig: externalId,
        userEmail: authState.email,
      },
      source: data.source,
    };
    dispatch(runNewCalculation({ client: cdfClient, item }));
  };

  if (!selectedEvent) {
    return null;
  }

  const buttonIcon = isCalculationReadyOrRunning
    ? 'LoadingSpinner'
    : 'CaretClosedDefault';

  return (
    <>
      <CapitalizedLabel size="medium" variant={STATUS_TYPE[status]}>
        {status}
      </CapitalizedLabel>
      <RunCalculationButton
        aria-label={status}
        disabled={isCalculationReadyOrRunning}
        type="ghost"
        icon={buttonIcon}
        onClick={onClickRun}
      />
    </>
  );
}
