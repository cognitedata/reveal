/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector, SectorGeometry, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { OperatorFunction, pipe, Observable, from, merge, partition, of, asapScheduler, zip, Subject } from 'rxjs';
import {
  publish,
  filter,
  flatMap,
  map,
  share,
  tap,
  shareReplay,
  take,
  retry,
  reduce,
  subscribeOn,
  retryWhen,
  delay,
  distinct,
  catchError,
  distinctUntilChanged
} from 'rxjs/operators';
import { CadSectorParser } from './CadSectorParser';
import { SimpleAndDetailedToSector3D } from './SimpleAndDetailedToSector3D';
import { CadSectorProvider } from './CadSectorProvider';
import { MemoryRequestCache } from '@/utilities/cache/MemoryRequestCache';
import { ParseCtmResult } from '@/utilities/workers/types/parser.types';
import { SectorQuads } from '../rendering/types';
import { RateLimiter } from '@/utilities';

// TODO: j-bjorne 16-04-2020: REFACTOR FINALIZE INTO SOME OTHER FILE PLEZ!
export class CachedRepository implements Repository {
  private readonly _modelDataCache: MemoryRequestCache<string, Observable<ConsumedSector>> = new MemoryRequestCache({
    maxElementsInCache: 50
  });
  private readonly _ctmFileCache: MemoryRequestCache<string, Observable<ParseCtmResult>> = new MemoryRequestCache({
    maxElementsInCache: 300
  });
  private readonly _modelSectorProvider: CadSectorProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;
  private readonly _rateLimiter = new RateLimiter(50);
  private readonly _isLoadingSubject: Subject<boolean> = new Subject();

  // Adding this to support parse map for migration wrapper. Should be removed later.
  private readonly _parsedDataSubject: Subject<{
    blobUrl: string;
    sectorId: number;
    lod: string;
    data: SectorGeometry | SectorQuads;
  }> = new Subject();

  private isDisposed = false;

  constructor(
    modelSectorProvider: CadSectorProvider,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D
  ) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
  }

  clearSemaphore() {
    this._rateLimiter.clearPendingRequests();
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    this._isLoadingSubject.complete();
    this.clearSemaphore();
    this.clearCache();
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  loadSector(): OperatorFunction<WantedSector, ConsumedSector> {
    return pipe(
      subscribeOn(asapScheduler),
      publish((wantedSectorObservable: Observable<WantedSector>) => {
        // Creates an observable for simple and detailed only.
        const simpleAndDetailedObservable = wantedSectorObservable.pipe(
          filter(wantedSector => wantedSector.levelOfDetail !== LevelOfDetail.Discarded),
          share()
        );

        // Splits the observable into two observables based on the result of the predication
        const [cachedSectorObservable, uncachedSectorObservable] = partition(
          simpleAndDetailedObservable,
          wantedSector => this._modelDataCache.has(this.cacheKey(wantedSector))
        );

        const discardedSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
          filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded),
          map(wantedSector => ({ ...wantedSector, group: undefined }))
        );

        const releaseSlot = () => {
          this._rateLimiter.release();
          this._isLoadingSubject.next(this._rateLimiter.usedSlots() > 0);
        };

        return merge(
          cachedSectorObservable.pipe(flatMap(wantedSector => this._modelDataCache.get(this.cacheKey(wantedSector)))),
          uncachedSectorObservable.pipe(
            flatMap(async (wantedSector: WantedSector) => {
              // Try to acquire a slot. If the rateLimiter is cleared because a new frame of
              // wantedSectors are received, this will return false and the wantedSector
              // will be filtered out further down. If it succeeds, the sector will be loaded.
              const ready = await this._rateLimiter.acquire();
              return {
                wantedSector,
                ready
              };
            }),
            // Only let sectors that got a slot through.
            filter((data: { wantedSector: WantedSector; ready: boolean }) => data.ready),
            map((data: { wantedSector: WantedSector; ready: boolean }) => data.wantedSector),
            // Actually load the sector
            this.loadSectorFromNetwork(),
            catchError(e => {
              // If there are any errors, release the slot and pass the error on further down the
              // pipe for handling.
              releaseSlot();
              return of(e);
            }),
            tap(releaseSlot)
          ),
          discardedSectorObservable
        );
      }),
      retryWhen(errors => {
        return errors.pipe(
          // tslint:disable-next-line:no-console
          tap(e => console.error(e)),
          delay(5000)
        );
      })
    );
  }

  getLoadingStateObserver(): Observable<boolean> {
    return this._isLoadingSubject.pipe(distinctUntilChanged(), share());
  }

  clearCache() {
    this._modelDataCache.clear();
  }

  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._parsedDataSubject.pipe(distinct(keySelector => '' + keySelector.blobUrl + '.' + keySelector.sectorId)); // TODO: Should we do replay subject here instead of variable type?
  }

  private loadSectorFromNetwork(): OperatorFunction<WantedSector, ConsumedSector> {
    return publish(wantedSectorObservable => {
      const simpleSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
        filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Simple),
        flatMap((wantedSector: WantedSector) => {
          const networkObservable: Observable<ConsumedSector> = from(
            this._modelSectorProvider.getCadSectorFile(wantedSector.blobUrl, wantedSector.metadata.facesFile.fileName!)
          ).pipe(
            retry(3),
            flatMap(data => this._modelDataParser.parseF3D(new Uint8Array(data))),
            map(data => {
              this._parsedDataSubject.next({
                blobUrl: wantedSector.blobUrl,
                sectorId: wantedSector.metadata.id,
                lod: 'simple',
                data
              });
              return { ...wantedSector, data };
            }),
            this._modelDataTransformer.transform(),
            tap(group => {
              group.name = `Quads ${wantedSector.metadata.id}`;
            }),
            map(group => ({ ...wantedSector, group })),
            shareReplay(1),
            take(1)
          );
          while (true) {
            try {
              this._modelDataCache.add(this.cacheKey(wantedSector), networkObservable);
              break;
            } catch (e) {
              this._modelDataCache.cleanCache(10);
            }
          }
          return networkObservable;
        })
      );
      const detailedSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
        filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Detailed),
        // tap(e => this.requestSet.add(this.cacheKey(e))),
        flatMap(wantedSector => {
          const i3dFileObservable = of(wantedSector.metadata.indexFile).pipe(
            flatMap(indexFile => this._modelSectorProvider.getCadSectorFile(wantedSector.blobUrl, indexFile.fileName)),
            retry(3),
            flatMap(buffer => this._modelDataParser.parseI3D(new Uint8Array(buffer)))
          );

          const ctmFilesObservable = from(wantedSector.metadata.indexFile.peripheralFiles).pipe(
            map(fileName => ({
              blobUrl: wantedSector.blobUrl,
              fileName
            })),
            this.loadCtmFile(),
            reduce((accumulator, value) => {
              accumulator.set(value.fileName, value.data);
              return accumulator;
            }, new Map())
          );
          const networkObservable = zip(i3dFileObservable, ctmFilesObservable).pipe(
            flatMap(([i3dFile, ctmFiles]) => this._modelDataParser.async_finalizeDetailed(i3dFile, ctmFiles)),
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
          );
          while (true) {
            try {
              this._modelDataCache.add(this.cacheKey(wantedSector), networkObservable);
              break;
            } catch (e) {
              this._modelDataCache.cleanCache(10);
            }
          }
          return networkObservable;
        })
      );
      return merge(simpleSectorObservable, detailedSectorObservable);
    });
  }

  private loadCtmFile(): OperatorFunction<
    { blobUrl: string; fileName: string },
    { fileName: string; data: ParseCtmResult }
  > {
    return publish(ctmRequestObservable => {
      const [cachedCtmFileObservable, uncachedCtmFileObservable] = partition(ctmRequestObservable, ctmRequest =>
        this._ctmFileCache.has(this.ctmKey(ctmRequest))
      );
      return merge(
        cachedCtmFileObservable.pipe(
          flatMap(
            ctmRequest => this._ctmFileCache.get(this.ctmKey(ctmRequest)),
            (ctmRequest, data) => ({ fileName: ctmRequest.fileName, data })
          )
        ),
        uncachedCtmFileObservable.pipe(this.loadCtmFileFromNetwork())
      );
    });
  }

  private loadCtmFileFromNetwork(): OperatorFunction<
    { blobUrl: string; fileName: string },
    { fileName: string; data: ParseCtmResult }
  > {
    return pipe(
      flatMap(
        ctmRequest => {
          const networkObservable = from(
            this._modelSectorProvider.getCadSectorFile(ctmRequest.blobUrl, ctmRequest.fileName)
          ).pipe(
            retry(3),
            flatMap(buffer => this._modelDataParser.parseCTM(new Uint8Array(buffer))),
            shareReplay(1),
            take(1)
          );
          while (true) {
            try {
              this._ctmFileCache.add(this.ctmKey(ctmRequest), networkObservable as Observable<ParseCtmResult>);
              break;
            } catch (e) {
              this._ctmFileCache.cleanCache(10);
            }
          }
          return networkObservable;
        },
        (ctmRequest, data) => ({ fileName: ctmRequest.fileName, data: data as ParseCtmResult })
      )
    );
  }

  private cacheKey(wantedSector: WantedSector) {
    return '' + wantedSector.blobUrl + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }

  private ctmKey(request: { blobUrl: string; fileName: string }) {
    return '' + request.blobUrl + '.' + request.fileName;
  }
}
