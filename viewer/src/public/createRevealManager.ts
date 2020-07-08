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
  initMetrics(revealOptions.logMetrics !== false, 'local', {
    moduleName: 'RevealManager',
    methodName: 'constructor',
    constructorOptions: omit(revealOptions, ['internal'])
  });
  return createRevealManager(modelDataClient, revealOptions);
}
export function createCdfRevealManager(
  client: CogniteClient,
  revealOptions: RevealOptions = {}
): RevealManager<CdfModelIdentifier> {
  initMetrics(revealOptions.logMetrics !== false, client.project, {
    moduleName: 'RevealManager',
    methodName: 'constructor',
    constructorOptions: omit(revealOptions, ['internal'])
  });
  const modelDataClient = new CdfModelDataClient(client);
  return createRevealManager(modelDataClient, revealOptions);
}

export function createRevealManager<T>(
  client: ModelDataClient<T>,
  revealOptions: RevealOptions = {}
): RevealManager<T> {
  const cadManager = createCadManager(client, revealOptions);
  const pointCloudManager = createPointCloudManager(client);
  return new RevealManager(cadManager, pointCloudManager);
}
