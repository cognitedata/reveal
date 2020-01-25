/*!
 * Copyright 2020 Cognite AS
 */
// @ts-ignore
import * as Potree from '@cognite/potree-core';

import { SectorModelTransformation } from '../cad/types';

export type FetchPointCloudDelegate = () => Promise<[Potree.PointCloudOctreeGeometry, SectorModelTransformation]>;
