/*!
 * Copyright 2020 Cognite AS
 */

import { filter } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { Cad } from '@/dataModels/cad/cad-model-loading/Cad';
import { PointCloud } from '@/dataModels/point-cloud/internal/PointCloud';
import { File3dFormat } from './File3dFormat';

export function isCad(): OperatorFunction<any, Cad> {
  return filter((item): item is Cad => item.format === File3dFormat.RevealCadModel);
}

export function isPointCloud(): OperatorFunction<any, PointCloud> {
  return filter((item): item is PointCloud => item.format === File3dFormat.EptPointCloud);
}
