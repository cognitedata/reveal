/*!
 * Copyright 2020 Cognite AS
 */

import { Observable, OperatorFunction, pipe, partition, merge, from } from 'rxjs';
import { publish, flatMap, mergeAll, shareReplay, take, map } from 'rxjs/operators';
import { ModelSectorService } from '../network/client/ModelSectorService';
import { ModelSectorFormat } from '../parser/ModelSectorData';
import { RxModelSectorParser } from '../parser/RxModelDataParser';

interface ModelSector {
  modelId: number;
  file: string;
  format: ModelSectorFormat;
  toString(): string;
}

export class RxModelSectorsRepository<T> {
  private readonly modelService: ModelSectorService;
  private readonly sectorDataParser: RxModelSectorParser<T>;
  private readonly sectorCache: { [modelSector: string]: Observable<T> } = {};

  constructor(modelService: ModelSectorService, sectorDataParser: RxModelSectorParser<T>) {
    this.modelService = modelService;
    this.sectorDataParser = sectorDataParser;
  }

  getSectors(): OperatorFunction<ModelSector[], any> {
    return pipe(
      mergeAll(20),
      publish(modelSectorArrayObservable => {
        const [cachedSectorsObservable, networkSectorsObservable] = partition(
          modelSectorArrayObservable,
          modelSector => {
            return this.sectorCache[modelSector.toString()] !== undefined;
          }
        );
        return merge(
          cachedSectorsObservable.pipe(flatMap(modelSector => this.sectorCache[modelSector.toString()])),
          networkSectorsObservable.pipe(
            flatMap(modelSector => {
              const networkObservable = from(
                this.modelService.fetchModelSector(modelSector.modelId, modelSector.file)
              ).pipe(
                map(uint8Array => ({ format: modelSector.format, data: uint8Array })),
                this.sectorDataParser.parseData(),
                shareReplay(1),
                take(1)
              );
              this.sectorCache[modelSector.toString()] = networkObservable;
              return networkObservable;
            })
          )
        );
      })
    );
  }
}
