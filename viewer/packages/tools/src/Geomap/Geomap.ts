/*!
 * Copyright 2021 Cognite AS
 */
// @ts-ignore
import * as GEOTHREE from 'geo-three';
import { Cognite3DViewer } from '@reveal/core';
import { LatLongPosition, MapConfig, MapProviders } from './MapConfig';

export class Geomap {
  private readonly _viewer: Cognite3DViewer;
  private _map: GEOTHREE.MapView;

  constructor(viewer: Cognite3DViewer, mapConfig: MapConfig) {
    this._viewer = viewer;
    const mapProvider = this.getMapProvider(mapConfig);
    this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, mapProvider, mapProvider);
    this._viewer.addObject3D(this._map);
    this._viewer.requestRedraw();

    const coords = GEOTHREE.UnitsUtils.datumsToSpherical(mapConfig.latlong.latitude, mapConfig.latlong.longitude);
    const bound = this._viewer.models[0].getModelBoundingBox();
    this._map.position.set(-coords.x, bound.min.y, coords.y);
    this._map.updateMatrixWorld(true);
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
          mapConfig.appCode as string,
          mapConfig.style as string,
          mapConfig.scheme as string,
          mapConfig.imageFormat as string,
          mapConfig.size as number
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

      default:
        throw new Error('Unsupported map provider');
    }

    return mapProvider;
  }

  public latLongToWorldCoordinates(latLong: LatLongPosition) {
    return GEOTHREE.UnitsUtils.datumsToSpherical(latLong.latitude, latLong.longitude);
  }

  public dispose(): void {
    this._viewer.removeObject3D(this._map);
  }
}
