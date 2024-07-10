/*!
 * Copyright 2024 Cognite AS
 */
import { chunk } from 'lodash';
import {
  type CreateInstanceItem,
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InstanceFilter
} from '../../../utilities/FdmSDK';
import { type Observation, OBSERVATION_SOURCE, type ObservationProperties } from './models';
import { type Overlay3D } from '@cognite/reveal';

import { v4 as uuid } from 'uuid';

export async function fetchObservations(fdmSdk: FdmSDK): Promise<Observation[]> {
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
  observationOverlays: Array<Overlay3D<ObservationProperties>>
): Promise<Observation[]> {
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
): Promise<Observation[]> {
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
  overlay: Overlay3D<ObservationProperties>
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
          ...overlay.getContent(),
          type: 'simple',
          sourceId: id
        }
      }
    ]
  };
}

export async function deleteObservationInstances(
  fdmSdk: FdmSDK,
  observations: Array<Overlay3D<Observation>>
): Promise<void> {
  await fdmSdk.deleteInstances(
    observations.map((observation) => ({
      instanceType: 'node',
      externalId: observation.getContent().externalId,
      space: observation.getContent().space
    }))
  );
}
