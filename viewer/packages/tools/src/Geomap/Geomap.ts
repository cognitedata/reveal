/*!
 * Copyright 2021 Cognite AS
 */
// To overcome "implicitly has an 'any' type" and "unused variable reference" error in the geo-three library
// @ts-ignore
import * as GEOTHREE from 'geo-three';
import { Cognite3DViewer } from '@reveal/core';
import { LatLongPosition, MapConfig, MapProviders } from './MapConfig';

export class Geomap {
  private readonly _viewer: Cognite3DViewer;
  private _map: GEOTHREE.MapView;
  private _intervalId: any = 0;
  private readonly _onCameraChange = this.handleCameraChange.bind(this);

  constructor(viewer: Cognite3DViewer, mapConfig: MapConfig) {
    this._viewer = viewer;
    const mapProvider = this.getMapProvider(mapConfig);
    this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, mapProvider, mapProvider);
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
    let mapProvider: GEOTHREE.MapProvider;
    switch (mapConfig.provider) {
      case MapProviders.BingMap:
        mapProvider = new GEOTHREE.BingMapsProvider(mapConfig.APIKey, mapConfig.type);
        break;
      case MapProviders.HereMap:
        mapProvider = new GEOTHREE.HereMapsProvider(
          mapConfig.APIKey,
          mapConfig.appCode,
          mapConfig.style,
          mapConfig.scheme,
          mapConfig.imageFormat,
          mapConfig.size
        );
        break;
      case MapProviders.MapboxMap:
        mapProvider = new GEOTHREE.MapBoxProvider(mapConfig.APIKey, mapConfig.id, mapConfig.mode, mapConfig.tileFormat);
        break;
      case MapProviders.OpenStreetMap:
        mapProvider = new GEOTHREE.OpenStreetMapsProvider();
        break;

      default:
        throw new Error('Unsupported map provider');
    }

    return mapProvider;
  }

  public latLongToWorldCoordinates(latLong: LatLongPosition) {
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
