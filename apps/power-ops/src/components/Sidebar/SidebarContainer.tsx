import { Loader } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import { Sidebar } from 'components/Sidebar/Sidebar';
import debounce from 'lodash/debounce';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useCallback } from 'react';
import { useLocation, useParams, useRouteMatch } from 'react-router-dom';

type Props = {
  bidProcessEventExternalId: string;
  open: boolean;
  onOpenClose: (open: boolean) => void;
};

const SidebarContainer = ({
  bidProcessEventExternalId,
  open,
  onOpenClose,
}: Props) => {
  const metrics = useMetrics('portfolio');
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const { priceAreaExternalId } = useParams<{ priceAreaExternalId: string }>();
  const { data: bidProcessResult, isFetching } = useFetchBidProcessResult(
    priceAreaExternalId,
    bidProcessEventExternalId
  );

  const trackSearchMetric = useCallback(
    debounce((section: string) => {
      metrics.track('click-sidebar-plant-link', {
        selectedPlant: section,
      });
    }, 300),
    []
  );

  if (isFetching) return <Loader />;
  if (!bidProcessResult) return <>Bid Process not Found</>;

  return (
    <Sidebar
      open={open}
      onOpenCloseClick={(fromSearch = false) => {
        onOpenClose(!open);
        if (fromSearch) {
          metrics.track('click-open-search-button');
        } else {
          metrics.track(`click-${open ? 'close' : 'open'}-portfolio-sidebar`);
        }
      }}
      onNavigate={(section) => {
        if (['total', 'price-scenarios'].includes(section)) {
          metrics.track(`click-sidebar-${section}-link`);
        } else {
          trackSearchMetric(section);
        }
      }}
      onSearch={(term, clear = false) => {
        if (clear) {
          metrics.track('click-clear-search-button');
        } else {
          metrics.track('type-search-input', { term });
        }
      }}
      total={{
        url: `${url}/total`,
        current: pathname === `${url}/total`,
      }}
      priceScenarios={{
        url: `${url}/price-scenarios`,
        current: pathname === `${url}/price-scenarios`,
      }}
      plants={bidProcessResult.plants.map((plant) => ({
        name: plant.displayName,
        externalId: plant.externalId,
        url: `${url}/${plant.externalId}`,
        current: pathname === `${url}/${plant.externalId}`,
      }))}
    />
  );
};

export default SidebarContainer;
