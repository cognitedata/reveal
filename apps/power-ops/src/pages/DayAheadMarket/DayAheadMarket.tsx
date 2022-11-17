import { Loader } from '@cognite/cogs.js';
import { Redirect } from 'react-router-dom';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { PAGES } from 'types';

export const DayAheadMarket = () => {
  const { data: priceAreas, status } = useFetchPriceAreas();

  if (status === 'loading')
    return <Loader infoTitle="Loading Price Areas" darkMode={false} />;
  if (status === 'error')
    return <NotFoundPage message="Error fetching Price Areas" />;

  if (priceAreas.length === 0)
    return <NotFoundPage message="No price areas found" />;

  return (
    <Redirect to={`${PAGES.DAY_AHEAD_MARKET}/${priceAreas[0].externalId}`} />
  );
};
