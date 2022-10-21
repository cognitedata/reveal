import { useMetrics } from '@cognite/metrics';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useFetchProcessConfigurations } from 'queries/useFetchProcessConfigurations';
import { useParams } from 'react-router-dom';
import { downloadBidMatrices, formatDate } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { DayAheadMarketHeader } from 'components/DayAheadMarketHeader/DayAheadMarketHeader';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { useEffect, useMemo, useState } from 'react';
import { shopPenaltiesExceedLimit } from 'components/ShopQualityAssuranceModal/utils';

type Props = {
  bidProcessEventExternalId: string;
  onChangeBidProcessEventExternalId: (externalId: string) => void;
};

const DayAheadMarketHeaderContainer = ({
  bidProcessEventExternalId,
  onChangeBidProcessEventExternalId,
}: Props) => {
  const metrics = useMetrics('day-ahead-market');

  const { project, token } = useAuthenticatedAuthContext();
  const { priceAreaExternalId } = useParams<{ priceAreaExternalId: string }>();

  const [downloadingMatrix, setDownloadingMatrix] = useState(false);
  const [showConfirmDownloadModal, setShowConfirmDownloadModal] =
    useState(false);

  const { data: priceAreas } = useFetchPriceAreas();
  const { data: bidProcessResult } = useFetchBidProcessResult(
    priceAreaExternalId,
    bidProcessEventExternalId
  );
  const { data: processConfigurations = [] } =
    useFetchProcessConfigurations(priceAreaExternalId);

  const penaltiesLimitExceeded = useMemo(() => {
    if (!bidProcessResult) return false;
    return shopPenaltiesExceedLimit(bidProcessResult);
  }, [bidProcessResult]);

  const handleDownloadMatrix = async (externalId: string) => {
    metrics.track(`click-download-matrices-button`, {
      bidProcessExternalId: externalId,
    });
    if (!bidProcessResult) return Promise.reject();
    setDownloadingMatrix(true);
    const matrixes = await downloadBidMatrices(
      bidProcessResult,
      project,
      token
    );
    setDownloadingMatrix(false);
    return matrixes;
  };

  const handleDownloadButtonClick = async () => {
    if (penaltiesLimitExceeded) {
      setShowConfirmDownloadModal(true);
    } else {
      setDownloadingMatrix(true);
      await handleDownloadMatrix(bidProcessEventExternalId);
      setDownloadingMatrix(false);
    }
  };

  useEffect(() => {
    if (processConfigurations.length > 0)
      onChangeBidProcessEventExternalId(
        processConfigurations[0].bidProcessEventExternalId
      );
  }, [processConfigurations]);

  return (
    <DayAheadMarketHeader
      bidProcessExternalId={bidProcessEventExternalId}
      startDate={
        bidProcessResult
          ? formatDate(
              bidProcessResult.startDate,
              bidProcessResult.marketConfiguration?.timezone
            )
          : 'Loading...'
      }
      processConfigurations={processConfigurations}
      priceAreaName={
        priceAreas?.find((pa) => pa.externalId === priceAreaExternalId)?.name ??
        'Loading...'
      }
      showConfirmDownloadModal={showConfirmDownloadModal}
      downloading={downloadingMatrix}
      onChangeShowConfirmDownloadModal={setShowConfirmDownloadModal}
      onChangeProcessConfigurationExternalId={(externalId) => {
        metrics.track(`click-process-configuration-dropdown`, {
          selectedConfiguration: externalId,
        });
        onChangeBidProcessEventExternalId(externalId);
      }}
      onDownloadMatrix={handleDownloadMatrix}
      onDownloadButtonClick={handleDownloadButtonClick}
    />
  );
};

export default DayAheadMarketHeaderContainer;
