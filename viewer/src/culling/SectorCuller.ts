import { OperatorFunction } from 'rxjs';
import { DetermineSectorsInput } from '../models/cad/types';
import { WantedSector } from '../data/model/WantedSector';

export interface SectorCuller {
  determineSectors(): OperatorFunction<DetermineSectorsInput, WantedSector[]>;
}
