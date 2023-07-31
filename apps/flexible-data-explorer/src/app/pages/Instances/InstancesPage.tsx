import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { RelationshipDirectWidget } from '../../containers/widgets/RelationshipDirect/RelationshipDirect';
import { RelationshipEdgesWidget } from '../../containers/widgets/RelationshipEdges/RelationshipEdgesWidget';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useFDM } from '../../providers/FDMProvider';
import { useInstancesQuery } from '../../services/instances/generic/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { dataType, dataModel, space, version } = useParams();
  const client = useFDM();
  const { data, isLoading, isFetched, status } = useInstancesQuery();

  const [, setRecentlyVisited] = useRecentlyVisited();

  const directRelationships = client.getDirectRelationships(dataType, {
    dataModel,
    space,
    version,
  });

  const edgeRelationships = client.listEdgeRelationships(dataType, {
    dataModel,
    space,
    version,
  });

  useEffect(() => {
    return () => {
      if (isFetched) {
        setRecentlyVisited(data?.name, data?.description);
      }
    };
  }, [isFetched]);

  return (
    <Page.Dashboard customName={data?.name} loading={isLoading}>
      <Page.Widgets>
        {directRelationships?.map((item) => (
          <RelationshipDirectWidget
            key={item.name}
            id={item.name}
            type={{ field: item.name, type: item.type.name }}
          />
        ))}

        <PropertiesWidget
          id="Properties"
          state={status}
          data={data}
          columns={4}
        />

        {edgeRelationships?.map((item) => {
          return (
            <RelationshipEdgesWidget
              key={item.name}
              id={item.name}
              type={{ field: item.name, type: item.type.name }}
              columns={2}
            />
          );
        })}
      </Page.Widgets>
    </Page.Dashboard>
  );
};
