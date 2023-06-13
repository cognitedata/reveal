import { useParams } from 'react-router-dom';

import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets';
import { TimeseriesWidget } from '../../containers/widgets/TimeseriesWidget';
import { useTimeseriesByIdQuery } from '../../services/instances/timeseries/queries/useTimeseriesByIdQuery';

export const TimeseriesPage = () => {
  const { externalId } = useParams();

  const { data, isLoading } = useTimeseriesByIdQuery(externalId);

  return (
    <Page.Dashboard
      customName={data?.name}
      customDataType="Timeseries"
      loading={isLoading}
    >
      <Page.Widgets>
        <TimeseriesWidget
          id="Timeseries"
          timeseriesId={data?.id}
          rows={8}
          columns={2}
        />
        <PropertiesWidget id="Properties" data={data} columns={2} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
