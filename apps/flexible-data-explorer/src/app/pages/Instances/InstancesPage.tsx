import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { useInstancesQuery } from '../../services/instances/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { data, isLoading } = useInstancesQuery();

  console.log('data', data);

  return (
    <Page.Dashboard loading={isLoading}>
      <Page.Widgets>
        <PropertiesWidget id="Properties" data={data} columns={2} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
