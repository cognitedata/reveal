import {
  StatisticsStatus,
  StatisticsStatusStatusEnum,
} from '@cognite/calculation-backend';
import { useState, useEffect } from 'react';
import {
  useStatisticsResult,
  useStatisticsStatus,
} from 'hooks/calculation-backend';

interface Props {
  id: string | number;
  renderStatus?: (calculationStatus: StatisticsStatus) => JSX.Element | null;
  renderLoading?: () => JSX.Element | null;
}

function InnerStatisticsCallStatus({
  id,
  renderStatus = () => null,
  renderLoading,
}: Props) {
  const [refetchInterval, setInterval] = useState<number | false>(1000);

  const { data: call, isError: callError } = useStatisticsStatus(id, {
    refetchInterval,
  });

  const {
    data: response,
    isError: responseError,
    refetch: refetchResponse,
  } = useStatisticsResult(id, {
    // Some other compoment could have called this hook prematurly, setting it in a completed state
    // in the query cache with null as the response body. It is therefore refetch below then the
    // status is Success.
    enabled: call?.status === 'Success',
  });

  const apiError = callError || responseError;
  const callStatus = call?.status;
  useEffect(() => {
    if (response === null && call?.status === 'Success') {
      refetchResponse();
    }
  }, [call?.status, response, refetchResponse]);

  useEffect(() => {
    if (
      (callStatus && callStatus !== 'Running' && callStatus !== 'Pending') ||
      apiError
    ) {
      setInterval(false);
    } else {
      setInterval(1000);
    }
  }, [call, callStatus, apiError]);

  if (apiError) {
    return renderStatus({
      id: String(id),
      status: StatisticsStatusStatusEnum.Failed,
    });
  }

  if (!call) {
    return renderLoading ? renderLoading() : null;
  }

  return renderStatus(call);
}

export default function StatisticsCallStatus({
  id,
  renderStatus,
  renderLoading,
}: Props) {
  if (!id) {
    return null;
  }
  return (
    <InnerStatisticsCallStatus
      id={id}
      renderStatus={renderStatus}
      renderLoading={renderLoading}
    />
  );
}
