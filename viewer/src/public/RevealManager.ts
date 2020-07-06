/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase } from './RevealManagerBase';
import { CogniteClient } from '@cognite/sdk';
import { CdfModelDataClient } from '@/utilities/networking/CdfModelDataClient';
import { PotreeGroupWrapper, PotreeNodeWrapper } from '@/internal';
import { CadNode, NodeAppearanceProvider } from '@/datamodels/cad';
import { RevealOptions } from './types';
import omit from 'lodash/omit';
import { initMetrics } from '@/utilities/metrics';

type CdfModelIdentifier = { modelId: number; revisionId: number };

export class RevealManager extends RevealManagerBase<CdfModelIdentifier> {
  constructor(client: CogniteClient, options: RevealOptions = {}) {
    initMetrics(options.logMetrics !== false, client.project, {
      moduleName: 'RevealManager',
      methodName: 'constructor',
      constructorOptions: omit(options, ['internal'])
    });
    const clientExt = new CdfModelDataClient(client);
    super(clientExt, options);
  }

  public addModel(
    type: 'cad',
    modelRevisionId: { modelId: number; revisionId: number },
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode>;
  public addModel(
    type: 'pointcloud',
    modelRevisionId: { modelId: number; revisionId: number }
  ): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    modelRevisionId: { modelId: number; revisionId: number },
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return super.loadModel('cad', modelRevisionId, nodeApperanceProvider);
      case 'pointcloud':
        return super.loadModel('pointcloud', modelRevisionId);

      default:
        throw new Error(`Model type '${type}' is not supported`);
    }
  }
}
