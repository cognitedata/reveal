import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { DEFAULT_DATE_RANGE } from '@cognite/plotting-components';

import { Button } from '../../components/buttons/Button';
import { Dropdown } from '../../components/dropdown/Dropdown';
import { DateRange } from '../../containers/Filter/types';
import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets';
import { TimeseriesWidget } from '../../containers/widgets/Timeseries/TimeseriesWidget';
import { useOpenIn } from '../../hooks/useOpenIn';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useTimeseriesByIdQuery } from '../../services/instances/timeseries/queries/useTimeseriesByIdQuery';

export const TimeseriesPage = () => {
  const { externalId } = useParams();
  const [, setRecentlyVisited] = useRecentlyVisited();
  const { openAssetCentricResourceItemInCanvas, openInCharts } = useOpenIn();

  const { data, isLoading, isFetched, status } =
    useTimeseriesByIdQuery(externalId);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    DEFAULT_DATE_RANGE
  );

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleNavigateToCanvasClick = () => {
    openAssetCentricResourceItemInCanvas({ id: data?.id, type: 'timeSeries' });
  };

  const handleNavigateToChartsClick = () => {
    openInCharts(data?.id, dateRange);
  };

  useEffect(() => {
    return () => {
      if (isFetched && externalId) {
        setRecentlyVisited(data?.name, data?.description, {
          externalId,
          dataType: 'Timeseries',
        });
      }
    };
  }, [isFetched]);

  return (
    <Page.Dashboard
      name={data?.name}
      dataType="Timeseries"
      loading={isLoading}
      renderActions={() => [
        <Dropdown.OpenIn
          onChartsClick={handleNavigateToChartsClick}
          onCanvasClick={handleNavigateToCanvasClick}
          disabled={isLoading}
        >
          <Button.OpenIn loading={isLoading} />
        </Dropdown.OpenIn>,
      ]}
    >
      <Page.Widgets>
        <TimeseriesWidget
          id="Timeseries"
          timeseriesId={data?.id}
          dateRange={dateRange}
          onChangeDateRange={handleDateRangeChange}
          rows={6}
          columns={4}
        />
        <PropertiesWidget
          id="Properties"
          data={data}
          state={status}
          columns={4}
        />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
