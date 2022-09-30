import { Loader } from '@cognite/cogs.js';
import { Redirect } from 'react-router-dom';
import { PAGES } from 'App';
import { useFetchPriceAreas } from 'queries/useFetchPriceArea';
import { NotFoundPage } from 'pages/NotFound/NotFound';

export const Portfolio = () => {
  const { data: priceAreas = [], isFetched, isFetching } = useFetchPriceAreas();

  if (isFetching) return <Loader infoTitle="Loading Price Areas" />;

  if (isFetched && priceAreas.length === 0)
    return <NotFoundPage message="No price areas found" />;

  return <Redirect to={`${PAGES.PORTFOLIO}/${priceAreas[0].externalId}`} />;
};
