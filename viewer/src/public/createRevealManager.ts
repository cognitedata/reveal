/*!
 * Copyright 2020 Cognite AS
 */

import { LocalModelIdentifier, CdfModelIdentifier, ModelDataClient } from '@/utilities/networking/types';
import { CdfModelDataClient } from '@/utilities/networking/CdfModelDataClient';
import { CogniteClient } from '@cognite/sdk';
import { createCadManager } from '@/datamodels/cad/createCadManager';
import { createPointCloudManager } from '@/datamodels/pointcloud/createPointCloudManager';
import { RevealManager } from './RevealManager';
import { LocalModelDataClient } from '@/utilities/networking/LocalModelDataClient';
import { RevealOptions } from './types';
import { initMetrics } from '@/utilities/metrics';
import { omit } from 'lodash';

export function createLocalRevealManager(revealOptions: RevealOptions = {}): RevealManager<LocalModelIdentifier> {
  const modelDataClient = new LocalModelDataClient();
  return createRevealManager('local', modelDataClient, revealOptions);
}

export function createCdfRevealManager(
  client: CogniteClient,
  revealOptions: RevealOptions = {}
): RevealManager<CdfModelIdentifier> {
  const modelDataClient = new CdfModelDataClient(client);
  return createRevealManager(client.project, modelDataClient, revealOptions);
}

export function createRevealManager<T>(
  project: string,
  client: ModelDataClient<T>,
  revealOptions: RevealOptions = {}
): RevealManager<T> {
  initMetrics(revealOptions.logMetrics !== false, project, {
    moduleName: 'createRevealManager',
    methodName: 'createRevealManager',
    constructorOptions: omit(revealOptions, ['internal'])
  });
  const cadManager = createCadManager(client, revealOptions);
  const pointCloudManager = createPointCloudManager(client);
  return new RevealManager(cadManager, pointCloudManager);
}
