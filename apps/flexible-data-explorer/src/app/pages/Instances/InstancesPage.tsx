import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Button, Dropdown } from '@fdx/components';
import { Page } from '@fdx/modules/page/Page';
import { PropertiesWidget } from '@fdx/modules/widgets/Properties/PropertiesWidget';
import { RelationshipDirectWidget } from '@fdx/modules/widgets/RelationshipDirect/RelationshipDirect';
import { RelationshipEdgesWidget } from '@fdx/modules/widgets/RelationshipEdges/RelationshipEdgesWidget';
import { ThreeDWidget } from '@fdx/modules/widgets/ThreeD/ThreeDWidget';
import { useInstancesQuery } from '@fdx/services/instances/generic/queries/useInstanceByIdQuery';
import { useOpenIn } from '@fdx/shared/hooks/useOpenIn';
import { useRecentlyVisited } from '@fdx/shared/hooks/useRecentlyVisited';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { ContainerReferenceType } from '@fdx/shared/types/canvas';

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
