import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import dayjs from 'dayjs';

import { ResourceItem } from '@data-exploration-lib/core';

import { Button } from '../../components/buttons/Button';
import { Dropdown } from '../../components/dropdown/Dropdown';
import { Menu } from '../../components/menu/Menu';
import { DateRange } from '../../containers/Filter/types';
import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets';
import { TimeseriesWidget } from '../../containers/widgets/TimeseriesWidget';
import { useNavigation } from '../../hooks/useNavigation';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useTimeseriesByIdQuery } from '../../services/instances/timeseries/queries/useTimeseriesByIdQuery';

const TimeseriesActions = ({
  loading,
  onCanvasClick,
  onChartsClick,
}: {
  loading?: boolean;
  onCanvasClick?: () => void;
  onChartsClick?: () => void;
}) => {
  return (
    <Dropdown
      placement="bottom-end"
      content={
        <Menu>
          {onCanvasClick && <Menu.OpenInCanvas onClick={onCanvasClick} />}
          {onChartsClick && <Menu.OpenInCharts onClick={onChartsClick} />}
        </Menu>
      }
      disabled={false}
    >
      <Button.OpenIn loading={loading} />
    </Dropdown>
  );
};

export const TimeseriesPage = () => {
  const navigate = useNavigation();
  const { externalId } = useParams();
  const [, setRecentlyVisited] = useRecentlyVisited();

  const { data, isLoading, isFetched } = useTimeseriesByIdQuery(externalId);

  const [dateRange, setDateRange] = useState<DateRange | undefined>([
    dayjs().subtract(2, 'years').startOf('seconds').toDate(),
    dayjs().startOf('seconds').toDate(),
  ]);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const handleNavigateToCanvasClick = () => {
    if (data && data.id) {
      const timeSeries: ResourceItem = {
        id: data?.id,
        type: 'timeSeries',
        externalId,
      };
      navigate.toCanvas(timeSeries);
    }
  };

  const handleNavigateToChartsClick = () => {
    if (data && data.id && dateRange) {
      navigate.toCharts(data.id, dateRange);
    }
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
      customName={data?.name}
      customDataType="Timeseries"
      loading={isLoading}
      renderActions={() => [
        <TimeseriesActions
          loading={isLoading}
          onCanvasClick={handleNavigateToCanvasClick}
          onChartsClick={handleNavigateToChartsClick}
        />,
      ]}
    >
      <Page.Widgets>
        <PropertiesWidget id="Properties" data={data} columns={4} />
        <TimeseriesWidget
          id="Timeseries"
          timeseriesId={data?.id}
          dateRange={dateRange}
          onChangeDateRange={handleDateRangeChange}
          rows={8}
          columns={4}
        />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
