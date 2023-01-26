import { Loader } from '@cognite/cogs.js-v9';
import { useMetrics } from '@cognite/metrics';
import { CommonSidebar } from 'components/CommonSidebar/CommonSidebar';
import { PriceAreaSidebarContent } from 'components/PriceAreaSidebar/PriceAreaSidebarContent';
import debounce from 'lodash/debounce';
import { useFetchBidProcessResult } from 'queries/useFetchBidProcessResult';
import { useCallback } from 'react';
import { useLocation, useParams, useRouteMatch } from 'react-router-dom-v5';
import { SECTIONS } from 'types';
import { sortPlants } from 'utils/utils';

type Props = {
  bidProcessEventExternalId: string;
  open: boolean;
  onOpenClose: (open: boolean) => void;
};

export const PriceAreaSidebarContainer = ({
  bidProcessEventExternalId,
  open,
  onOpenClose,
}: Props) => {
  const metrics = useMetrics(SECTIONS.DAY_AHEAD_MARKET);
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const { priceAreaExternalId } = useParams<{ priceAreaExternalId: string }>();
  const { data: bidProcessResult, status } = useFetchBidProcessResult(
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

  if (status === 'loading') return <Loader darkMode={false} />;
  if (status === 'error') return <>Error fetching Bid Process</>;

  return (
    <CommonSidebar
      initiallyOpen={open}
      onOpenCloseClick={(fromSearch = false) => {
        onOpenClose(!open);
        if (fromSearch) {
          metrics.track('click-open-search-button');
        } else {
          metrics.track(
            `click-${open ? 'close' : 'open'}-day-ahead-market-sidebar`
          );
        }
      }}
    >
      <PriceAreaSidebarContent
        onNavigate={(section) => {
          if ([SECTIONS.TOTAL, SECTIONS.PRICE_SCENARIOS].includes(section)) {
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
          url: `${url}/${SECTIONS.TOTAL}`,
          current: pathname === `${url}/${SECTIONS.TOTAL}`,
        }}
        priceScenarios={{
          url: `${url}/${SECTIONS.PRICE_SCENARIOS}`,
          current: pathname === `${url}/${SECTIONS.PRICE_SCENARIOS}`,
        }}
        methodPerformance={{
          url: `${url}/${SECTIONS.BENCHMARKING}`,
          current: pathname === `${url}/${SECTIONS.BENCHMARKING}`,
        }}
        plants={bidProcessResult.plants.sort(sortPlants).map((plant) => ({
          name: plant.displayName,
          externalId: plant.externalId,
          url: `${url}/${plant.externalId}`,
          current: pathname === `${url}/${plant.externalId}`,
        }))}
      />
    </CommonSidebar>
  );
};
