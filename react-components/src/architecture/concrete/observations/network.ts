/*!
 * Copyright 2024 Cognite AS
 */
import { chunk } from 'lodash';
import {
  type CreateInstanceItem,
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InstanceFilter
} from '../../../data-providers/FdmSDK';
import { type ObservationFdmNode, OBSERVATION_SOURCE, type ObservationProperties } from './models';

import { v4 as uuid } from 'uuid';

export async function fetchObservations(fdmSdk: FdmSDK): Promise<ObservationFdmNode[]> {
  const observationsFilter: InstanceFilter = {};

  const observationResult = await fdmSdk.filterAllInstances<ObservationProperties>(
    observationsFilter,
    'node',
    OBSERVATION_SOURCE
  );

  return observationResult.instances;
}

export async function createObservationInstances(
  fdmSdk: FdmSDK,
  observationOverlays: ObservationProperties[]
): Promise<ObservationFdmNode[]> {
  const chunks = chunk(observationOverlays, 100);
  const resultPromises = chunks.map(async (chunk) => {
    const payloads = chunk.map(createObservationInstancePayload);
    const instanceResults = await fdmSdk.createInstance<ObservationProperties>(payloads);
    return instanceResults.items;
  });

  const createResults = (await Promise.all(resultPromises)).flat();

  return await fetchObservationsWithIds(fdmSdk, createResults);
}

async function fetchObservationsWithIds(
  fdmSdk: FdmSDK,
  identifiers: DmsUniqueIdentifier[]
): Promise<ObservationFdmNode[]> {
  return (
    await fdmSdk.filterInstances<ObservationProperties>(
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
      OBSERVATION_SOURCE
    )
  ).instances.map((observation) => observation);
}

function createObservationInstancePayload(
  observation: ObservationProperties
): CreateInstanceItem<ObservationProperties> {
  const id = uuid();
  return {
    instanceType: 'node' as const,
    externalId: uuid(),
    space: 'observations',
    sources: [
      {
        source: OBSERVATION_SOURCE,
        properties: {
          ...observation,
          type: 'simple',
          sourceId: id
        }
      }
    ]
  };
}

export async function deleteObservationInstances(
  fdmSdk: FdmSDK,
  observations: ObservationFdmNode[]
): Promise<void> {
  await fdmSdk.deleteInstances(
    observations.map((observation) => ({
      instanceType: 'node',
      externalId: observation.externalId,
      space: observation.space
    }))
  );
}
