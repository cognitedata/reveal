/*!
 * Copyright 2021 Cognite AS
 */
// To overcome "implicitly has an 'any' type" and "unused variable reference" error in the geo-three library
// @ts-ignore
import { GEOTHREE } from 'geo-three';
import { Cognite3DViewer } from '@reveal/api';
import { LatLongPosition, MapConfig, MapProviders } from './MapConfig';
import { err, ok, Result } from 'neverthrow';

export class Geomap {
  private readonly _viewer: Cognite3DViewer;
  private readonly _map: GEOTHREE.MapView;
  private _intervalId: any = 0;
  private readonly _onCameraChange = this.handleCameraChange.bind(this);

  constructor(viewer: Cognite3DViewer, mapConfig: MapConfig) {
    this._viewer = viewer;
    const mapProvider = this.getMapProvider(mapConfig);
    if (mapProvider.isErr()) {
      throw new Error('Map provider key or related keys is missing/wrong');
    }
    this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, mapProvider.value, mapProvider.value);
    this._viewer.addObject3D(this._map);

    const coords = GEOTHREE.UnitsUtils.datumsToSpherical(mapConfig.latlong.latitude, mapConfig.latlong.longitude);
    const bound = this._viewer.models[0].getModelBoundingBox();
    this._map.position.set(-coords.x, bound.min.y, coords.y);
    this._map.updateMatrixWorld(true);
    this.requestRedraw(10000);
    this._viewer.on('cameraChange', this._onCameraChange);
  }

  private requestRedraw(timeOut: number) {
    if (this._intervalId == 0) {
      this._intervalId = setInterval(() => {
        this._viewer.requestRedraw();
      }, 100);

      setTimeout(() => {
        clearInterval(this._intervalId);
        this._intervalId = 0;
      }, timeOut);
    }
  }

  private getMapProvider(mapConfig: MapConfig) {
    let mapProvider: Result<GEOTHREE.MapProvider, Error>;
    try {
      switch (mapConfig.provider) {
        case MapProviders.BingMap:
          mapProvider = new GEOTHREE.BingMapsProvider(mapConfig.APIKey, mapConfig.type);
          break;
        case MapProviders.HereMap:
          mapProvider = new GEOTHREE.HereMapsProvider(
            mapConfig.APIKey,
            mapConfig.appCode!,
            mapConfig.style!,
            mapConfig.scheme!,
            mapConfig.imageFormat!,
            mapConfig.size!
          );
          break;
        case MapProviders.MapboxMap:
          mapProvider = new GEOTHREE.MapBoxProvider(
            mapConfig.APIKey,
            mapConfig.id,
            mapConfig.mode,
            mapConfig.tileFormat
          );
          break;
        case MapProviders.OpenStreetMap:
          mapProvider = new GEOTHREE.OpenStreetMapsProvider();
          break;

        default:
          throw new Error('Unsupported map provider');
      }

      return ok(mapProvider);
    } catch (error: unknown) {
      return err(error);
    }
  }

  public latLongToWorldCoordinates(latLong: LatLongPosition): { x: number; y: number } {
    return GEOTHREE.UnitsUtils.datumsToSpherical(latLong.latitude, latLong.longitude);
  }

  private handleCameraChange() {
    this.requestRedraw(1000);
  }

  public dispose(): void {
    this._viewer.removeObject3D(this._map);
    this._viewer.off('cameraChange', this._onCameraChange);
  }
}
