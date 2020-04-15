/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction, merge } from 'rxjs';
import { SectorQuads, Sector } from '../../models/cad/types';
import { publish, filter, flatMap } from 'rxjs/operators';
import { ParseSectorDelegate } from '../../models/cad/delegates';

export class CADSectorParser {
  private readonly oldDetailedParser: ParseSectorDelegate<Sector>;
  private readonly oldSimpleParser: ParseSectorDelegate<SectorQuads>;
  constructor(detailedParser: ParseSectorDelegate<Sector>, simpleParser: ParseSectorDelegate<SectorQuads>) {
    this.oldDetailedParser = detailedParser;
    this.oldSimpleParser = simpleParser;
  }

  parse(): OperatorFunction<{ format: string; data: Uint8Array }, any | Sector | SectorQuads> {
    return publish(dataObservable => {
      const i3dObservable = dataObservable.pipe(
        filter(data => data.format === 'i3d'),
        flatMap(data => this.oldDetailedParser(data.data))
      );
      const f3dObservable = dataObservable.pipe(
        filter(data => data.format === 'f3d'),
        flatMap(data => this.oldSimpleParser(data.data))
      );
      return merge(i3dObservable, f3dObservable);
    });
  }
}
