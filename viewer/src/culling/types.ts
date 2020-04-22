/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene } from '../models/cad/types';
import { WantedSector } from '../data/model/WantedSector';

export type PrioritizedWantedSector = WantedSector & { priority: number; scene: SectorScene };
