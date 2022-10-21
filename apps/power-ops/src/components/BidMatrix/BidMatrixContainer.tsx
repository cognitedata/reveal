import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMetrics } from '@cognite/metrics';
import { Loader } from '@cognite/cogs.js';
import { useFetchBidMatrix } from 'queries/useFetchBidMatrix';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useFetchScenarioPrice } from 'queries/useFetchScenarioPrice';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { BidMatrix } from 'components/BidMatrix/BidMatrix';
import {
  copyMatrixToClipboard,
  formatBidMatrixData,
  formatScenarioData,
} from 'components/BidMatrix/utils';

import { Main } from './elements';

type Props = {
  bidProcessEventExternalId: string;
};

export const BidMatrixContainer = ({ bidProcessEventExternalId }: Props) => {
  const metrics = useMetrics('bid-matrix');

  const { priceAreaExternalId, plantExternalId } = useParams<{
    plantExternalId: string;
    priceAreaExternalId: string;
  }>();

  const { data: bidProcessResult, status: fetchBidProcessStatus } =
    useFetchBidProcessResult(priceAreaExternalId, bidProcessEventExternalId);

  const plant = bidProcessResult
    ? bidProcessResult.plants.find((p) => p.externalId === plantExternalId)
    : undefined;

  const bidMatrixExternalId = useMemo(() => {
    if (!bidProcessResult?.totalMatrix || !bidProcessResult?.plantMatrixes)
      return '';
    if (plantExternalId === 'total')
      return bidProcessResult.totalMatrix.externalId;

    return (
      bidProcessResult.plantMatrixes.find((p) => p.plantName === plant?.name)
        ?.matrix?.externalId ?? ''
    );
  }, [bidProcessResult, plantExternalId]);

  const bidDate = useMemo(() => {
    if (!bidProcessResult) return undefined;
    return dayjs(bidProcessResult.bidDate).tz(
      bidProcessResult.marketConfiguration?.timezone
    );
  }, [bidProcessResult, plantExternalId]);

  const { data: bidMatrixData, status: fetchBidMatrixStatus } =
    useFetchBidMatrix(bidMatrixExternalId);
  const {
    data: mainScenarioPricesPerHour,
    status: fetchMainScenarioPricesStatus,
  } = useFetchScenarioPrice(bidDate, bidProcessResult?.mainScenarioExternalId);

  // Loading States
  if (fetchBidProcessStatus === 'idle' || fetchBidProcessStatus === 'loading')
    return <Loader infoTitle="Loading Bid Process" darkMode={false} />;
  if (
    fetchMainScenarioPricesStatus === 'idle' ||
    fetchMainScenarioPricesStatus === 'loading'
  )
    return <Loader infoTitle="Loading Scenario Price" darkMode={false} />;
  if (fetchBidMatrixStatus === 'idle' || fetchBidMatrixStatus === 'loading')
    return <Loader infoTitle="Loading Bid Matrix" darkMode={false} />;

  // Errors
  if (fetchBidProcessStatus === 'error')
    return <NotFoundPage message="Failure loading Bid Process" />;
  if (fetchBidMatrixStatus === 'error')
    return <NotFoundPage message="Failure loading Bid Matrix" />;
  if (fetchMainScenarioPricesStatus === 'error')
    return <NotFoundPage message="Failure loading Scenario Price" />;

  // Data Formatters
  const formattedBidMatrixTableData = formatBidMatrixData(
    bidMatrixData,
    bidProcessResult.marketConfiguration?.tick_size
  );
  const formattedMainScenarioTableData = formatScenarioData(
    mainScenarioPricesPerHour,
    bidMatrixData
  );

  // Action Handlers
  const getMatrixTitle = () => {
    if (plantExternalId === 'total') return 'Total';
    return plant?.displayName ?? plantExternalId;
  };

  const handleCopyBidMatrixClick = async () => {
    metrics.track('click-copy-bid-matrix-button', {
      matrixExternalId: bidMatrixExternalId,
    });
    return copyMatrixToClipboard(
      formattedBidMatrixTableData.columns,
      formattedBidMatrixTableData.data
    );
  };

  return (
    <Main>
      <BidMatrix
        bidDate={bidDate}
        bidMatrixTitle={getMatrixTitle()}
        bidMatrixExternalId={bidMatrixExternalId}
        bidMatrixTableData={formattedBidMatrixTableData}
        mainScenarioTableData={formattedMainScenarioTableData}
        onBidMatrixCopyClick={handleCopyBidMatrixClick}
      />
    </Main>
  );
};
