/*!
 * Copyright 2024 Cognite AS
 */
import { chunk } from 'lodash';
import {
  type CreateInstanceItem,
  type DmsUniqueIdentifier,
  type FdmSDK
} from '../../../../data-providers/FdmSDK';
import { type ObservationInstance, type ObservationProperties } from '../models';

import { v4 as uuid } from 'uuid';
import { OBSERVATION_SOURCE } from './view';
import { restrictToDmsId } from '../../../../data-providers/utils/restrictToDmsId';

export async function fetchObservations(
  fdmSdk: FdmSDK
): Promise<Array<ObservationInstance<DmsUniqueIdentifier>>> {
  const observationResult = await fdmSdk.filterAllInstances<ObservationProperties>(
    undefined,
    'node',
    OBSERVATION_SOURCE
  );

  return observationResult.instances.map((observation) => ({
    id: restrictToDmsId(observation),
    properties: observation.properties
  }));
}

export async function createObservationInstances(
  fdmSdk: FdmSDK,
  observationOverlays: ObservationProperties[]
): Promise<Array<ObservationInstance<DmsUniqueIdentifier>>> {
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
): Promise<Array<ObservationInstance<DmsUniqueIdentifier>>> {
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
  ).instances.map((observation) => ({
    id: restrictToDmsId(observation),
    properties: observation.properties
  }));
}

function createObservationInstancePayload(
  observation: ObservationProperties
): CreateInstanceItem<ObservationProperties> {
  return {
    instanceType: 'node' as const,
    externalId: uuid(),
    space: 'observations',
    sources: [
      {
        source: OBSERVATION_SOURCE,
        properties: {
          ...observation
        }
      }
    ]
  };
}

export async function deleteObservationInstances(
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
