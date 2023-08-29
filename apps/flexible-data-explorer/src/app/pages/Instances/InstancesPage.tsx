import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { ContainerReferenceType } from 'libs/industry-canvas/src/lib/types';

import { Button } from '../../components/buttons/Button';
import { Dropdown } from '../../components/dropdown/Dropdown';
import { Page } from '../../containers/page/Page';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { RelationshipDirectWidget } from '../../containers/widgets/RelationshipDirect/RelationshipDirect';
import { RelationshipEdgesWidget } from '../../containers/widgets/RelationshipEdges/RelationshipEdgesWidget';
import { ThreeDWidget } from '../../containers/widgets/ThreeD/ThreeDWidget';
import { useOpenIn } from '../../hooks/useOpenIn';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useFDM } from '../../providers/FDMProvider';
import { useInstancesQuery } from '../../services/instances/generic/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { dataType, dataModel, space, version } = useParams();
  const client = useFDM();
  const { data, isLoading, isFetched, status } = useInstancesQuery();
  const { openContainerReferenceInCanvas } = useOpenIn();

  const [, setRecentlyVisited] = useRecentlyVisited();

  const handleNavigateToCanvasClick = () => {
    openContainerReferenceInCanvas({
      type: ContainerReferenceType.FDM_INSTANCE,
      instanceExternalId: data?.externalId,
      instanceSpace: data?.space,
      viewExternalId: dataType,
      viewSpace: space,
    });
  };

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
    <Page.Dashboard
      dataType={dataType}
      name={data?.name}
      description={data?.description}
      loading={isLoading}
      renderActions={() => [
        <Dropdown.OpenIn
          onCanvasClick={handleNavigateToCanvasClick}
          disabled={isLoading}
        >
          <Button.OpenIn loading={isLoading} />
        </Dropdown.OpenIn>,
      ]}
    >
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
          if (item.isThreeD) {
            return <ThreeDWidget id="3d" />;
          }

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
