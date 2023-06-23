import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { RelationshipEdgesWidget } from '../../containers/widgets/RelationshipEdges/RelationshipEdgesWidget';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useTypesDataModelQuery } from '../../services/dataModels/query/useTypesDataModelQuery';
import { useInstancesQuery } from '../../services/instances/generic/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { dataType } = useParams();
  const { data, isLoading, isFetched } = useInstancesQuery();

  const [, setRecentlyVisited] = useRecentlyVisited();

  // const params = useParams();
  const { data: types } = useTypesDataModelQuery();

  // Fix me
  const edges = (types || [])
    .find((item) => item.name === dataType)
    ?.fields.filter((item) => Boolean(item.type.custom && item.type.list));

  useEffect(() => {
    return () => {
      if (isFetched) {
        setRecentlyVisited(data?.name, data?.description);
      }
    };
  }, [isFetched]);

  return (
    <Page.Dashboard loading={isLoading}>
      <Page.Widgets>
        <PropertiesWidget id="Properties" data={data} columns={2} />
        {edges?.map((item) => {
          return (
            <RelationshipEdgesWidget
              key={item.name}
              id={item.name}
              type={{ field: item.name, type: item.type.name }}
            />
          );
        })}
      </Page.Widgets>
    </Page.Dashboard>
  );
};
