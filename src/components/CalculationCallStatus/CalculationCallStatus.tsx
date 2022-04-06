import {
  CalculationStatus,
  CalculationStatusStatusEnum,
} from '@cognite/calculation-backend';
import { useState, useEffect } from 'react';
import {
  useCalculationQueryResult,
  useCalculationStatus,
} from 'hooks/calculation-backend';
import { DatapointsMultiQuery } from '@cognite/sdk';

interface Props {
  id: string;
  query: DatapointsMultiQuery;
  renderStatus?: (calculationStatus: CalculationStatus) => JSX.Element | null;
  renderLoading?: () => JSX.Element | null;
}

function InnerCalculationCallStatus({
  id,
  query,
  renderStatus = () => null,
  renderLoading,
}: Props) {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(2000);

  const { data: call, isError: callError } = useCalculationStatus(id, {
    refetchInterval,
  });

  const callStatus = call?.status;

  const {
    data: response,
    isError: responseError,
    refetch: refetchResponse,
  } = useCalculationQueryResult(id, query, {
    // Some other compoment could have called this hook prematurly, setting it in a completed state
    // in the query cache with null as the response body. It is therefore refetch below then the
    // status is Success.
    enabled: call?.status === 'Success',
  });

  const apiError = callError || responseError;

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
      setRefetchInterval(false);
    } else {
      setRefetchInterval(2000);
    }
  }, [call, callStatus, apiError]);

  if (apiError) {
    return renderStatus({
      id,
      status: CalculationStatusStatusEnum.Failed,
    });
  }

  if (!call) {
    return renderLoading ? renderLoading() : null;
  }

  return renderStatus(call);
}

export default function CalculationCallStatus({
  id,
  query,
  renderStatus,
  renderLoading,
}: Props) {
  if (!id) {
    return null;
  }
  return (
    <InnerCalculationCallStatus
      id={id}
      query={query}
      renderStatus={renderStatus}
      renderLoading={renderLoading}
    />
  );
}
