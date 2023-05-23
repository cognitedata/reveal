import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { useInstancesQuery } from '../../services/instances/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { data, isLoading } = useInstancesQuery();
  // const params = useParams();

  // const [_, setRecentlyViewed] = useLocalStorageState<any>(
  //   `recently-viewed-v2`,
  //   {
  //     defaultValue: [],
  //   }
  // );

  // useEffect(() => {
  //   setRecentlyViewed((prevState: any) => {
  //     return [
  //       ...prevState,
  //       { ...params, name: data?.name, visited: Date.now() },
  //     ];
  //   });
  // }, [isFetched]);

  return (
    <Page.Dashboard loading={isLoading}>
      <Page.Widgets>
        <PropertiesWidget id="Properties" data={data} columns={2} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
