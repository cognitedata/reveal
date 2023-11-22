/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type Source, type DmsUniqueIdentifier } from '../utilities/FdmSDK';
import assert from 'assert';

export function use3dRelatedDirectConnections(
  instance: DmsUniqueIdentifier | undefined
): UseQueryResult<DmsUniqueIdentifier[]> {
  const fdmSdk = useFdmSdk();

  return useQuery(
    ['reveal-react-components', 'get-3d-related-direct-connections'],
    async () => {
      const assertedInstance = instance ?? { space: '', externalId: '' };
      const views = await fdmSdk.inspectInstances({
        inspectionOperations: { involvedViewsAndContainers: {} },
        items: [{ instanceType: 'node', ...assertedInstance }]
      });

      const view = views.items[0].inspectionResults.involvedViewsAndContainers.views[0];
      const instanceContent = (
        await fdmSdk.getByExternalIds<Record<string, unknown>>(
          [{ instanceType: 'node', ...assertedInstance }],
          view
        )
      ).items[0];

      const directlyRelatedObjects = Object.values(instanceContent.properties)
        .map((spaceScope) =>
          Object.values(spaceScope)
            .map((fieldValues) =>
              Object.values(fieldValues).filter(
                (value: any): value is DmsUniqueIdentifier =>
                  value.externalId !== undefined && value.space !== undefined
              )
            )
            .flat()
        )
        .flat();

      if (directlyRelatedObjects.length === 0) {
        return [];
      }

      const relatedObjectInspectionsResult = await fdmSdk.inspectInstances({
        inspectionOperations: { involvedViewsAndContainers: {} },
        items: directlyRelatedObjects.map((fdmId) => ({ ...fdmId, instanceType: 'node' }))
      });

      const relatedObjectsViewLists = relatedObjectInspectionsResult.items.map(
        (item) => item.inspectionResults.involvedViewsAndContainers.views
      );

      const relatedObjectViewsWithObjectIndex = relatedObjectsViewLists
        .map((viewList, objectInd) => viewList.map((view) => [objectInd, view] as const))
        .flat();

      const [deduplicatedViews, deduplicatedViewsIndexMap] = createDeduplicatedListAndIndexMap(
        relatedObjectViewsWithObjectIndex
      );

      const viewProps = await fdmSdk.getViewsByIds(deduplicatedViews);

      const threeDRelatedViews = relatedObjectViewsWithObjectIndex.filter((_, viewIndex) => {
        const viewResultIndex = deduplicatedViewsIndexMap.get(viewIndex);
        assert(viewResultIndex !== undefined);
        const propsForView = viewProps.items[viewResultIndex];
        return Object.keys(propsForView.properties).some((propName) => propName === 'inModel3d');
      });

      return threeDRelatedViews.map(([index, _view]) => directlyRelatedObjects[index]);
    },
    {
      enabled: instance !== undefined
    }
  );
}

function createDeduplicatedListAndIndexMap(
  viewsWithObjectIndex: Array<readonly [number, Source]>
): [Source[], Map<number, number>] {
  const deduplicatedViews: Source[] = [];
  const deduplicatedViewsIndexMap = new Map<number, number>();
  viewsWithObjectIndex.forEach(([_index, view], viewIndex) => {
    const duplicateIndex = deduplicatedViews.findIndex(
      (potentialDuplicate) =>
        potentialDuplicate.externalId === view.externalId &&
        potentialDuplicate.space === view.space &&
        potentialDuplicate.version === view.version
    );

    if (duplicateIndex >= 0) {
      deduplicatedViewsIndexMap.set(viewIndex, duplicateIndex);
    } else {
      deduplicatedViewsIndexMap.set(viewIndex, deduplicatedViews.length);
      deduplicatedViews.push(view);
    }
  });

  return [deduplicatedViews, deduplicatedViewsIndexMap];
}
