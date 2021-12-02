import { useContext, MouseEvent } from 'react';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { selectSimulators } from 'store/simulator/selectors';
import { selectEventById } from 'store/event/selectors';
import { runNewCalculation } from 'store/event/thunks';
import { sanitizeValue } from 'utils/stringUtils';

import { EVENT_CONSTANTS } from './constants';
import { RunCalculationButton } from './elements';

interface ComponentProps {
  data: FileInfoSerializable;
}
export default function RunCalculationCell({ data }: ComponentProps) {
  const { cdfClient, authState } = useContext(CdfClientContext);

  const dispatch = useAppDispatch();
  const simulators = useAppSelector(selectSimulators);
  const selectedEvent = useAppSelector(selectEventById(data.externalId || ''));
  const status = selectedEvent?.metadata?.status || 'none';
  const isCalculationReadyOrRunning = ['ready', 'running'].includes(status);

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
    const sanitizedExternalId = sanitizeValue(
      `${source}-SR-${calcType}-${modelName}-${new Date().getTime()}`
    );
    const item = {
      externalId: sanitizedExternalId,
      dataSetId,
      type: EVENT_CONSTANTS.SIM_CALC,
      subtype: calcName,
      metadata: {
        connector: simulators[0].name || '',
        dataType: EVENT_CONSTANTS.SIM_CALC,
        runType: EVENT_CONSTANTS.MANUAL,
        status: 'ready',
        statusMessage: EVENT_CONSTANTS.READY_STATUS_MESSAGE,
        description: `${source} ${EVENT_CONSTANTS.PROSPER_SIM_EVENT}`,
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

  const buttonIcon = isCalculationReadyOrRunning
    ? 'LoadingSpinner'
    : 'CaretClosedDefault';

  return (
    <RunCalculationButton
      aria-label={status}
      disabled={isCalculationReadyOrRunning}
      type="ghost"
      icon={buttonIcon}
      onClick={onClickRun}
    />
  );
}
