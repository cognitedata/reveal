import { useMetrics } from '@cognite/metrics';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useFetchProcessConfigurations } from 'queries/useFetchProcessConfigurations';
import { useParams } from 'react-router-dom';
import { downloadBidMatrices, formatDate } from 'utils/utils';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { PortfolioHeader } from 'components/PortfolioHeader/PortfolioHeader';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { useEffect } from 'react';

type Props = {
  bidProcessEventExternalId: string;
  onChangeBidProcessEventExternalId: (externalId: string) => void;
};

const PortfolioHeaderContainer = ({
  bidProcessEventExternalId,
  onChangeBidProcessEventExternalId,
}: Props) => {
  const { project, token } = useAuthenticatedAuthContext();
  const metrics = useMetrics('portfolio');
  const { priceAreaExternalId } = useParams<{ priceAreaExternalId: string }>();

  const { data: priceAreas } = useFetchPriceAreas();

  const { data: bidProcessResult } = useFetchBidProcessResult(
    priceAreaExternalId,
    bidProcessEventExternalId
  );

  const { data: processConfigurations = [] } =
    useFetchProcessConfigurations(priceAreaExternalId);

  const handleDownloadMatrix = (externalId: string) => {
    metrics.track(`click-download-matrices-button`, {
      bidProcessExternalId: externalId,
    });
    if (!bidProcessResult) return Promise.reject();
    return downloadBidMatrices(bidProcessResult, project, token);
  };

  useEffect(() => {
    if (processConfigurations.length > 0)
      onChangeBidProcessEventExternalId(
        processConfigurations[0].bidProcessEventExternalId
      );
  }, [processConfigurations]);

  return (
    <PortfolioHeader
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
      onChangeProcessConfigurationExternalId={(externalId) => {
        metrics.track(`click-process-configuration-dropdown`, {
          selectedConfiguration: externalId,
        });
        onChangeBidProcessEventExternalId(externalId);
      }}
      onDownloadMatrix={handleDownloadMatrix}
    />
  );
};

export default PortfolioHeaderContainer;
