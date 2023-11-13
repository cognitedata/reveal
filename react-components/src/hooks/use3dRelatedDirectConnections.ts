/*!
 * Copyright 2023 Cognite AS
 */

import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type DmsUniqueIdentifier } from '../utilities/FdmSDK';

export function use3dRelatedDirectConnections(instance: DmsUniqueIdentifier | undefined): UseQueryResult<DmsUniqueIdentifier[]> {
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
      const newInstance = await fdmSdk.getByExternalIds<Record<string, unknown>>(
        [{ instanceType: 'node', ...assertedInstance }],
        view
      );

      const directlyRelatedObjects = Object.values(newInstance.items[0].properties).map(spaceScope => Object.values(spaceScope).map(fieldValues => Object.values(fieldValues).filter((value: any): value is DmsUniqueIdentifier => value.externalId !== undefined && value.space !== undefined)).flat()).flat();


      const relatedViewResult = await fdmSdk.inspectInstances({ inspectionOperations: { involvedViewsAndContainers: {} },
                                                                items: directlyRelatedObjects.map(fdmId => ({ ...fdmId, instanceType: 'node' }))});

      const relatedViewsWithInstanceIndex = relatedViewResult.items.map((item, ind) => item.inspectionResults.involvedViewsAndContainers.views.map(view => [ind, view] as const)).flat();

      const viewProps = await fdmSdk.getViewsByIds(
        relatedViewsWithInstanceIndex.map(([_ind, view]) => view)
      );

      const threeDRelatedViews = relatedViewsWithInstanceIndex.filter(([index, _view]) => {
        const propsForView = viewProps.items[index];
        return Object.keys(propsForView.properties).some(propName => propName === 'inModel3d');
      });

      return threeDRelatedViews.map(([index, _view]) => directlyRelatedObjects[index]);
    },
    {
      enabled: instance !== undefined
    }
  );
}
