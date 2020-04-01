/*!
 * Copyright 2020 Cognite AS
 */

import { RxModelSectorParser } from './RxModelDataParser';
import { RevealObject3D } from '../model/three/RevealObject3D';
import { OperatorFunction, pipe, merge } from 'rxjs';
import { ModelSectorData, ModelSectorFormat } from './ModelSectorData';
import { Sector, SectorQuads } from '../../models/cad/types';
import { publish, filter, map } from 'rxjs/operators';

interface WebAssemblyParser {
  parse(): OperatorFunction<ModelSectorData, Sector | SectorQuads>;
  /* Adding a second option here to just show a possible other way of parsing.
   * This can be done within the parser implementation or in the RxModelSectorParser implementation.
   * The next functions are used in the V2 example. This way we can expand the parser of having versioning support too.
   */
  parseSectorData(): OperatorFunction<Uint8Array, Sector>;
  parseSectorQuadsData(): OperatorFunction<Uint8Array, SectorQuads>;
}

interface ThreeJsParser {
  parse(): OperatorFunction<Sector | SectorQuads, RevealObject3D>;
}

export class ThreeModelDataParser implements RxModelSectorParser<RevealObject3D> {
  private readonly webAssemblyParser: WebAssemblyParser;
  private readonly threeJsParser: ThreeJsParser;
  constructor(webAssemblyParser: WebAssemblyParser, threeJsParser: ThreeJsParser) {
    this.webAssemblyParser = webAssemblyParser;
    this.threeJsParser = threeJsParser;
  }

  parseData(): OperatorFunction<ModelSectorData, RevealObject3D> {
    return pipe(this.webAssemblyParser.parse(), this.threeJsParser.parse());
  }

  /* This function is to show the option of holding the parsing data logic here instead of inside the parser.
   * One would implement on or the other
   */
  private parseDataV2(): OperatorFunction<ModelSectorData, RevealObject3D> {
    return publish(modelSectorObservable => {
      const sectorObservable = modelSectorObservable.pipe(
        filter(modelSectorData => modelSectorData.format === ModelSectorFormat.i3d),
        map(modelSectorData => modelSectorData.data),
        this.webAssemblyParser.parseSectorData()
      );
      const sectorQuadsObservable = modelSectorObservable.pipe(
        filter(modelSectorData => modelSectorData.format === ModelSectorFormat.f3d),
        map(modelSectorData => modelSectorData.data),
        this.webAssemblyParser.parseSectorQuadsData()
      );
      return merge(sectorObservable, sectorQuadsObservable).pipe(this.threeJsParser.parse());
    });
  }
}
