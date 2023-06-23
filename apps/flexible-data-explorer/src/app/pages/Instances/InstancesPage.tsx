import { useEffect } from 'react';

import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useInstancesQuery } from '../../services/instances/generic/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { data, isLoading, isFetched } = useInstancesQuery();

  const [, setRecentlyVisited] = useRecentlyVisited();

  useEffect(() => {
    return () => {
      if (isFetched) {
        console.log('UNMOUNTED');

        setRecentlyVisited(data?.name, data?.description);
      }
    };
  }, [isFetched]);

  return (
    <Page.Dashboard customName={data?.name} loading={isLoading}>
      <Page.Widgets>
        <PropertiesWidget id="Properties" data={data} columns={2} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
