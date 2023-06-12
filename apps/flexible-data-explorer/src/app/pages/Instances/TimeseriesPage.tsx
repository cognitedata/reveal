import { useParams } from 'react-router-dom';

import { Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets';
import { TimeseriesWidget } from '../../containers/widgets/TimeseriesWidget';

const getTimeseriesId = (externalId?: string) => {
  if (!externalId) {
    throw new Error('External id is required');
  }

  return Number(externalId) ? { id: Number(externalId) } : { externalId };
};

export const TimeseriesPage = () => {
  const { externalId } = useParams();

  const { data, isLoading } = useCdfItem<Timeseries>(
    'timeseries',
    getTimeseriesId(externalId),
    {
      enabled: !!externalId,
    }
  );

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
