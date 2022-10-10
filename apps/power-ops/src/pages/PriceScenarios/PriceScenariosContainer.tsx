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
  const { data, isFetching } = useFetchBidProcessResultWithData(
    priceAreaExternalId,
    bidProcessEventExternalId
  );

  if (isFetching)
    return <Loader infoTitle="Loading Bid Process Result" darkMode={false} />;
  if (!data) return <NotFoundPage message="Bid Process Result Not Found" />;

  return <PriceScenarios bidProcessResult={data} />;
};
