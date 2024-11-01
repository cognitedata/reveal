/*!
 * Copyright 2024 Cognite AS
 */
import { chunk } from 'lodash';
import {
  type CreateInstanceItem,
  type DmsUniqueIdentifier,
  type FdmSDK
} from '../../../../data-providers/FdmSDK';
import { type PointsOfInterestInstance, type PointsOfInterestProperties } from '../models';

import { v4 as uuid } from 'uuid';
import { POI_SOURCE } from './view';
import { restrictToDmsId } from '../../../../utilities/restrictToDmsId';

export async function fetchPointsOfInterest(
  fdmSdk: FdmSDK
): Promise<Array<PointsOfInterestInstance<DmsUniqueIdentifier>>> {
  const poiResult = await fdmSdk.filterAllInstances<PointsOfInterestProperties>(
    undefined,
    'node',
    POI_SOURCE
  );

  return poiResult.instances.map((poi) => ({
    id: restrictToDmsId(poi),
    properties: poi.properties
  }));
}

export async function createPointsOfInterestInstances(
  fdmSdk: FdmSDK,
  poiOverlays: PointsOfInterestProperties[]
): Promise<Array<PointsOfInterestInstance<DmsUniqueIdentifier>>> {
  const chunks = chunk(poiOverlays, 100);
  const resultPromises = chunks.map(async (chunk) => {
    const payloads = chunk.map(createPointsOfInterestInstancePayload);
    const instanceResults = await fdmSdk.createInstance<PointsOfInterestProperties>(payloads);
    return instanceResults.items;
  });

  const createResults = (await Promise.all(resultPromises)).flat();

  return await fetchPointsOfInterestsWithIds(fdmSdk, createResults);
}

async function fetchPointsOfInterestsWithIds(
  fdmSdk: FdmSDK,
  identifiers: DmsUniqueIdentifier[]
): Promise<Array<PointsOfInterestInstance<DmsUniqueIdentifier>>> {
  return (
    await fdmSdk.filterInstances<PointsOfInterestProperties>(
      {
        and: [
          {
            in: {
              property: ['node', 'externalId'],
              values: identifiers.map((identifier) => identifier.externalId)
            }
          },
          {
            in: {
              property: ['node', 'space'],
              values: identifiers.map((identifier) => identifier.space)
            }
          }
        ]
      },
      'node',
      POI_SOURCE
    )
  ).instances.map((poi) => ({
    id: restrictToDmsId(poi),
    properties: poi.properties
  }));
}

function createPointsOfInterestInstancePayload(
  poi: PointsOfInterestProperties
): CreateInstanceItem<PointsOfInterestProperties> {
  return {
    instanceType: 'node' as const,
    externalId: uuid(),
    space: POI_SOURCE.space,
    sources: [
      {
        source: POI_SOURCE,
        properties: {
          ...poi
        }
      }
    ]
  };
}

export async function deletePointsOfInterestInstances(
  fdmSdk: FdmSDK,
  ids: DmsUniqueIdentifier[]
): Promise<void> {
  await fdmSdk.deleteInstances(
    ids.map((id) => ({
      instanceType: 'node',
      externalId: id.externalId,
      space: id.space
    }))
  );
}