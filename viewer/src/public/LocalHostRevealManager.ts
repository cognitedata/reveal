/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase } from './RevealManagerBase';

import { PotreeGroupWrapper, PotreeNodeWrapper } from '@/internal';
import { LocalUrlClient as LocalHostClient } from '@/utilities/networking/LocalUrlClient';
import { CadNode, NodeAppearanceProvider } from '@/datamodels/cad';
import { RevealOptions } from './types';
import { initMetrics } from '@/utilities/metrics';
import { omit } from 'lodash';

type LocalModelIdentifier = string;

export class LocalHostRevealManager extends RevealManagerBase<LocalModelIdentifier> {
  constructor(options: RevealOptions = {}) {
    initMetrics(options.logMetrics !== false, 'local', {
      moduleName: 'RevealManager',
      methodName: 'constructor',
      constructorOptions: omit(options, ['internal'])
    });
    const localClient: LocalHostClient = new LocalHostClient();
    super(localClient, options);
  }

  public addModel(type: 'cad', fileName: string, nodeApperanceProvider?: NodeAppearanceProvider): Promise<CadNode>;
  public addModel(type: 'pointcloud', fileName: string): Promise<[PotreeGroupWrapper, PotreeNodeWrapper]>;
  public addModel(
    type: 'cad' | 'pointcloud',
    fileName: string,
    nodeApperanceProvider?: NodeAppearanceProvider
  ): Promise<CadNode | [PotreeGroupWrapper, PotreeNodeWrapper]> {
    switch (type) {
      case 'cad':
        return super.addModel('cad', fileName, nodeApperanceProvider);
      case 'pointcloud':
        return super.addModel('pointcloud', fileName);

      default:
        throw new Error(`case: ${type} not handled`);
    }
  }
}
