import { OperatorFunction } from 'rxjs';
import { WantedSector } from '../data/model/WantedSector';

export interface SectorCuller<Input> {
  determineSectors(): OperatorFunction<Input, WantedSector[]>;
}
