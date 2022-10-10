import { Loader } from '@cognite/cogs.js';
import { BidMatrix } from 'components/BidMatrix/BidMatrix';
import {
  copyMatrixToClipboard,
  formatBidMatrixData,
  formatScenarioData,
} from 'components/BidMatrix/utils';
import dayjs from 'dayjs';
import { useNewBidMatrixAvailable } from 'hooks/useNewBidMatrixAvailable';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { useFetchBidMatrix } from 'queries/useFetchBidMatrix';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useParams } from 'react-router-dom';
import { useMetrics } from '@cognite/metrics';
import { useMemo } from 'react';
import { useFetchScenarioPrice } from 'queries/useFetchScenarioPrice';

type Props = {
  bidProcessEventExternalId: string;
};

export const BidMatrixContainer = ({ bidProcessEventExternalId }: Props) => {
  const metrics = useMetrics('bid-matrix');

  const { priceAreaExternalId, plantExternalId } = useParams<{
    plantExternalId: string;
    priceAreaExternalId: string;
  }>();

  const newMatrixAvailable = useNewBidMatrixAvailable(
    priceAreaExternalId,
    bidProcessEventExternalId
  );
  const { data: bidProcessResult, isFetching: isFetchingBidProcess } =
    useFetchBidProcessResult(priceAreaExternalId, bidProcessEventExternalId);

  const plant = bidProcessResult
    ? bidProcessResult.plants.find((p) => p.externalId === plantExternalId)
    : undefined;

  const bidMatrixExternalId = useMemo(() => {
    if (!bidProcessResult?.totalMatrix || !bidProcessResult?.plantMatrixes)
      return undefined;

    return plantExternalId === 'total'
      ? bidProcessResult.totalMatrix.externalId
      : bidProcessResult.plantMatrixes.find((p) => p.plantName === plant?.name)
          ?.matrix?.externalId;
  }, [bidProcessResult, plantExternalId]);

  const bidDate = useMemo(() => {
    if (!bidProcessResult) return undefined;
    return dayjs(bidProcessResult.bidDate).tz(
      bidProcessResult.marketConfiguration?.timezone
    );
  }, [bidProcessResult, plantExternalId]);

  const { data: bidMatrixData, isFetching: isFetchingBidMatrix } =
    useFetchBidMatrix(bidMatrixExternalId);
  const {
    data: mainScenarioPricesPerHour,
    isFetching: isFetchingMainScenarioPrices,
  } = useFetchScenarioPrice(bidDate, bidProcessResult?.mainScenarioExternalId);

  // Loading States
  if (isFetchingBidProcess)
    return <Loader infoTitle="Loading Bid Process" darkMode={false} />;
  if (isFetchingMainScenarioPrices)
    return <Loader infoTitle="Loading Scenario Price" darkMode={false} />;
  if (isFetchingBidMatrix)
    return <Loader infoTitle="Loading Bid Matrix" darkMode={false} />;

  // Not Founds
  if (!bidProcessResult)
    return <NotFoundPage message="Bid Process Not Found" />;
  if (!bidMatrixData) return <NotFoundPage message="Bid Matrix Not Found" />;
  if (!mainScenarioPricesPerHour)
    return <NotFoundPage message="Scenario Price Not Found" />;
  if (!bidDate) return <NotFoundPage message="Bid date Not Found" />;

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

  const handleReloadClick = () => {
    metrics.track('click-reload-bid-matrix-button', { priceAreaExternalId });
    window.location.reload();
  };

  return (
    <BidMatrix
      newMatrixAvailable={newMatrixAvailable}
      bidDate={bidDate}
      bidMatrixTitle={getMatrixTitle()}
      bidMatrixExternalId={bidMatrixExternalId}
      bidMatrixTableData={formattedBidMatrixTableData}
      mainScenarioTableData={formattedMainScenarioTableData}
      onBidMatrixCopyClick={handleCopyBidMatrixClick}
      onReloadClick={handleReloadClick}
    />
  );
};
