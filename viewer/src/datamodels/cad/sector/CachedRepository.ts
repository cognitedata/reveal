/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector, SectorGeometry, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import {
  OperatorFunction,
  pipe,
  Observable,
  from,
  merge,
  partition,
  Subject,
  onErrorResumeNext,
  asapScheduler,
  BehaviorSubject
} from 'rxjs';
import {
  publish,
  filter,
  flatMap,
  map,
  tap,
  shareReplay,
  take,
  distinct,
  catchError,
  switchMap,
  distinctUntilChanged,
  share,
  finalize,
  subscribeOn
} from 'rxjs/operators';
import { CadSectorParser } from './CadSectorParser';
import { SimpleAndDetailedToSector3D } from './SimpleAndDetailedToSector3D';
import { MemoryRequestCache } from '@/utilities/cache/MemoryRequestCache';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { trackError } from '@/utilities/metrics';
import { CadSectorProvider, ModelDataClient } from '@/utilities/networking/types';

type ParsedData = { blobUrl: string; lod: string; data: SectorGeometry | SectorQuads };

// TODO: j-bjorne 16-04-2020: REFACTOR FINALIZE INTO SOME OTHER FILE PLEZ!
export class CachedRepository implements Repository {
  private readonly _consumedSectorCache: MemoryRequestCache<
    string,
    Observable<ConsumedSector>
  > = new MemoryRequestCache({
    maxElementsInCache: 50
  });

  private readonly _modelSectorProvider: CadSectorProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;
  private readonly _isLoadingSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  // Adding this to support parse map for migration wrapper. Should be removed later.
  private readonly _parsedDataSubject: Subject<{
    blobUrl: string;
    sectorId: number;
    lod: string;
    data: SectorGeometry | SectorQuads;
  }> = new Subject();

  private readonly _concurrentNetworkOperations: number;

  constructor(
    modelSectorProvider: CadSectorProvider,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D,
    concurrentNetworkOperations: number = 50
  ) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
    this._concurrentNetworkOperations = concurrentNetworkOperations;
  }

  clearCaches() {
    this._consumedSectorCache.clear();
  }

  getParsedData(): Observable<ParsedData> {
    return this._parsedDataSubject.pipe(
      distinct(keySelector => '' + keySelector.blobUrl + '.' + keySelector.sectorId + '.' + keySelector.lod)
    ); // TODO: Should we do replay subject here instead of variable type?
  }

  getLoadingStateObserver(): Observable<boolean> {
    return this._isLoadingSubject.pipe(distinctUntilChanged(), share());
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  loadSector(): OperatorFunction<WantedSector[], ConsumedSector> {
    return pipe(
      subscribeOn(asapScheduler),
      switchMap(wantedSectorsArray => {
        return from(wantedSectorsArray).pipe(
          tap(_ => {
            this._isLoadingSubject.next(true);
          }),
          publish(wantedSectorsObservable => {
            const simpleAndDetailedObservable = wantedSectorsObservable.pipe(
              filter(
                wantedSector =>
                  wantedSector.levelOfDetail === LevelOfDetail.Simple ||
                  wantedSector.levelOfDetail === LevelOfDetail.Detailed
              ),
              this.loadSimpleAndDetailedSector()
            );

            const discardedSectorObservable = wantedSectorsObservable.pipe(
              filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded),
              map(wantedSector => ({ ...wantedSector, group: undefined } as ConsumedSector))
            );

            return merge(simpleAndDetailedObservable, discardedSectorObservable);
          }),
          finalize(() => this._isLoadingSubject.next(false))
        );
      }),
      finalize(() => {
        this.clearCaches();
      })
    );
  }

  private loadSimpleAndDetailedSector(): OperatorFunction<WantedSector, ConsumedSector> {
    return publish(wantedSectorObservable => {
      const [cachedSectorObservable, uncachedSectorObservable] = partition(wantedSectorObservable, wantedSector =>
        this._consumedSectorCache.has(this.wantedSectorCacheKey(wantedSector))
      );

      return merge(
        cachedSectorObservable.pipe(
          flatMap(wantedSector => this._consumedSectorCache.get(this.wantedSectorCacheKey(wantedSector)))
        ),
        uncachedSectorObservable.pipe(this.loadSimpleAndDetailedSectorFromNetwork())
      );
    });
  }

  private loadSimpleAndDetailedSectorFromNetwork(): OperatorFunction<WantedSector, ConsumedSector> {
    return flatMap(wantedSector => {
      if (wantedSector.levelOfDetail === LevelOfDetail.Simple) {
        return this.loadSimpleSectorFromNetwork(wantedSector);
      } else if (wantedSector.levelOfDetail === LevelOfDetail.Detailed) {
        return this.loadDetailedSectorFromNetwork(wantedSector);
      } else {
        throw new Error('Unhandled LevelOfDetail');
      }
    }, this._concurrentNetworkOperations);
  }

  private loadSimpleSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const networkObservable: Observable<ConsumedSector> = onErrorResumeNext(
      from(
        this._modelSectorProvider.getCadSectorFile(wantedSector.blobUrl, wantedSector.metadata.facesFile.fileName!)
      ).pipe(
        catchError(error => {
          trackError(error, {
            moduleName: 'CachedRepository',
            methodName: 'loadSimpleSectorFromNetwork'
          });
          this._consumedSectorCache.remove(this.wantedSectorCacheKey(wantedSector));
          throw error;
        }),
        flatMap(buffer => this._modelDataParser.parseF3D(new Uint8Array(buffer))),
        tap(sectorQuads => {
          this._parsedDataSubject.next({
            blobUrl: wantedSector.blobUrl,
            sectorId: wantedSector.metadata.id,
            lod: 'simple',
            data: sectorQuads
          });
        }),
        map(sectorQuads => ({ ...wantedSector, data: sectorQuads })),
        this._modelDataTransformer.transform(),
        tap(group => {
          group.name = `Quads ${wantedSector.metadata.id}`;
        }),
        map(group => ({ ...wantedSector, group })),
        shareReplay(1),
        take(1)
      )
    );
    this._consumedSectorCache.forceInsert(this.wantedSectorCacheKey(wantedSector), networkObservable);
    return networkObservable;
  }

  private loadDetailedSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const detailedSectorObservable = onErrorResumeNext(
      from(
        this._modelDataParser.parseAndFinalizeI3D(wantedSector.metadata.indexFile.fileName, {
          fileNames: wantedSector.metadata.indexFile.peripheralFiles,
          blobUrl: wantedSector.blobUrl,
          headers: (this._modelSectorProvider as ModelDataClient<CadSectorProvider>).headers
        })
      ).pipe(
        catchError(error => {
          trackError(error, {
            moduleName: 'CachedRepository',
            methodName: 'loadDetailedSectorFromNetwork'
          });
          this._consumedSectorCache.remove(this.wantedSectorCacheKey(wantedSector));
          throw error;
        }),
        map(data => {
          this._parsedDataSubject.next({
            blobUrl: wantedSector.blobUrl,
            sectorId: wantedSector.metadata.id,
            lod: 'detailed',
            data
          }); // TODO: Remove when migration is gone.
          return { ...wantedSector, data };
        }),
        this._modelDataTransformer.transform(),
        map(group => ({ ...wantedSector, group })),
        shareReplay(1),
        take(1)
      )
    );
    this._consumedSectorCache.forceInsert(this.wantedSectorCacheKey(wantedSector), detailedSectorObservable);
    return detailedSectorObservable;
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return '' + wantedSector.blobUrl + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }
}
