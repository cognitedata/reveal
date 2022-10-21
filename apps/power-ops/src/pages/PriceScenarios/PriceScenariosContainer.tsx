import { Loader } from '@cognite/cogs.js';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { PriceScenarios } from 'pages/PriceScenarios/PriceScenarios';
import { useFetchBidProcessResultWithData } from 'queries/useFetchBidProcessResultWithData';
import { useParams } from 'react-router-dom';

type Props = {
  bidProcessEventExternalId: string;
};

export const PriceScenariosContainer = ({
  bidProcessEventExternalId,
}: Props) => {
  const { priceAreaExternalId } = useParams<{ priceAreaExternalId: string }>();
  const { data, status } = useFetchBidProcessResultWithData(
    priceAreaExternalId,
    bidProcessEventExternalId
  );

  if (status === 'idle' || status === 'loading')
    return <Loader infoTitle="Loading Bid Process Result" darkMode={false} />;
  if (status === 'error')
    return <NotFoundPage message="Error fetching Bid Process Result" />;

  return <PriceScenarios bidProcessResult={data} />;
};
