/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector } from '../../data/model/WantedSector';
import { LevelOfDetail } from '../../data/model/LevelOfDetail';
import { OperatorFunction, pipe, Observable, from, merge } from 'rxjs';
import { publish, filter, flatMap, map, share, tap, shareReplay, take } from 'rxjs/operators';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';
import { CADSectorParser } from '../../data/parser/CADSectorParser';
import { SimpleAndDetailedToSector3D } from '../../data/transformer/three/SimpleAndDetailedToSector3D';
import { ConsumedSector } from '../../data/model/ConsumedSector';

export class CachedRepository implements Repository {
  // TODO: j-bjorne 15/04/2020 - Should look into having a smarted cache (current one doesn't clear), should look at MemoryCache implementation
  private readonly _modelDataCache: Map<string, Observable<ConsumedSector>> = new Map();
  private readonly _modelDataParser: CADSectorParser;
  private readonly _modelDataRetriever: ModelDataRetriever;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;

  constructor(
    modelDataRetriever: ModelDataRetriever,
    modelDataParser: CADSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D
  ) {
    this._modelDataRetriever = modelDataRetriever;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
  }

  loadSector(): OperatorFunction<WantedSector, ConsumedSector> {
    return pipe(
      publish((wantedSectorObservable: Observable<WantedSector>) => {
        const simpleAndDetailedObservable = wantedSectorObservable.pipe(
          filter(wantedSector => wantedSector.levelOfDetail !== LevelOfDetail.Discarded),
          share()
        );

        const cachedObservable = simpleAndDetailedObservable.pipe(
          filter(wantedSector => this._modelDataCache.has('' + wantedSector.id + '.' + wantedSector.levelOfDetail)),
          flatMap(wantedSector => this._modelDataCache.get('' + wantedSector.id + '.' + wantedSector.levelOfDetail)!)
        );

        const uncachedObservable = simpleAndDetailedObservable.pipe(
          filter(wantedSector => !this._modelDataCache.has('' + wantedSector.id + '.' + wantedSector.levelOfDetail)),
          this.loadSectorFromNetwork()
        );

        const discardedSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
          filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded),
          map(wantedSector => ({ ...wantedSector, group: undefined }))
        );
        return merge(cachedObservable, uncachedObservable, discardedSectorObservable).pipe(
          // tap(e => console.log('Sector loaded', e))
        );
      })
    );
  }

  loadSectorFromNetwork(): OperatorFunction<WantedSector, ConsumedSector> {
    return publish(wantedSectorObservable => {
      const simpleSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
        filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Simple),
        flatMap((wantedSector: WantedSector) => {
          const networkObservable: Observable<ConsumedSector> = from(
            this._modelDataRetriever.fetchData(wantedSector.metadata.facesFile.fileName!)
          ).pipe(
            map(arrayBuffer => ({ format: 'f3d', data: new Uint8Array(arrayBuffer) })),
            this._modelDataParser.parse(),
            map(data => ({ ...wantedSector, data })),
            this._modelDataTransformer.transform(),
            tap(group => (group.name = `Quads ${wantedSector.id}`)),
            map(group => ({ ...wantedSector, group })),
            shareReplay(1),
            take(1)
          );
          this._modelDataCache.set('' + wantedSector.id + '.' + wantedSector.levelOfDetail, networkObservable);
          return networkObservable;
        })
      );
      const detailedSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
        filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Detailed),
        flatMap(wantedSector => {
          const networkObservable = from(
            this._modelDataRetriever.fetchData(wantedSector.metadata.indexFile.fileName)
          ).pipe(
            map(arrayBuffer => ({ format: 'i3d', data: new Uint8Array(arrayBuffer) })),
            this._modelDataParser.parse(),
            map(data => ({ ...wantedSector, data })),
            this._modelDataTransformer.transform(),
            map(group => ({ ...wantedSector, group })),
            shareReplay(1),
            take(1)
          );
          this._modelDataCache.set('' + wantedSector.id + '.' + wantedSector.levelOfDetail, networkObservable);
          return networkObservable;
        })
      );
      return merge(simpleSectorObservable, detailedSectorObservable);
    });
  }

  clearCache() {
    this._modelDataCache.clear();
  }
}
