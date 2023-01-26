import { Button, Loader } from '@cognite/cogs.js-v9';
import { Redirect } from 'react-router-dom-v5';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { PAGES } from 'types';
import { CommonError } from 'components/CommonError/CommonError';

export const DayAheadMarket = () => {
  const { data: priceAreas, status } = useFetchPriceAreas();

  if (status === 'loading')
    return <Loader infoTitle="Loading Price Areas" darkMode={false} />;
  if (status === 'error' || priceAreas.length === 0) {
    return (
      <CommonError
        title="No price areas found"
        illustrationType="MapPlaceLocation"
      >
        <div>
          It seems no price areas have been configured in your CDF project.
        </div>
        <div>Contact support if this problem persists</div>
        <Button
          type="primary"
          icon="ExternalLink"
          iconPlacement="right"
          onClick={() => window.open('https://support.cognite.com')}
        >
          Contact support
        </Button>
      </CommonError>
    );
  }

  return (
    <Redirect to={`${PAGES.DAY_AHEAD_MARKET}/${priceAreas[0].externalId}`} />
  );
};
