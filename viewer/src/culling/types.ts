/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene } from '../models/cad/SectorScene';
import { WantedSector } from '../data/model/WantedSector';

export type PrioritizedWantedSector = WantedSector & { priority: number; scene: SectorScene };
