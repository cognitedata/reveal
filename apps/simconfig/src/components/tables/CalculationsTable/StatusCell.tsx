import { useContext } from 'react';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { selectEventById } from 'store/event/selectors';
import { fetchLatestEventByCalculationId } from 'store/event/thunks';
import { usePolling } from 'hooks/usePolling';
import { CapitalizedLabel } from 'pages/elements';

import { EVENT_CONSTANTS, POLLING_TIME, STATUS_TYPE } from './constants';
import { WideCell } from './elements';

interface ComponentProps {
  data: FileInfoSerializable;
}
export default function StatusCell({ data }: ComponentProps) {
  const { cdfClient } = useContext(CdfClientContext);
  const dispatch = useAppDispatch();
  const selectedEvent = useAppSelector(selectEventById(data.externalId || ''));
  const status = selectedEvent?.metadata?.status || 'none';
  const isCalculationRunning = ['running'].includes(status);
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

  return (
    <WideCell>
      <CapitalizedLabel size="medium" variant={STATUS_TYPE[status]}>
        {status}
      </CapitalizedLabel>
    </WideCell>
  );
}
