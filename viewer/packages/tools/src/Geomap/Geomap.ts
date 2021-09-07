/*!
 * Copyright 2021 Cognite AS
 */

import * as GEOTHREE from 'geo-three';
import { Cognite3DViewer } from '@reveal/core';
import { MapConfig, APIKeys } from './MapConfig';

export class Geomap {

  private readonly _viewer: Cognite3DViewer;
  private _map: any;
  private _mapProvider: any;

  constructor(viewer: Cognite3DViewer, mapConfig: MapConfig) {
    this._viewer = viewer;
    this.getMapProvider(mapConfig);
    this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, this._mapProvider, this._mapProvider);
    this._viewer.addObject3D(this._map);
  }

  private getMapProvider(mapConfig: MapConfig) {
    switch(mapConfig.provider) {
      case 'BingMap':
        this._mapProvider = new GEOTHREE.BingMapsProvider( mapConfig.APIKey || APIKeys.DEV_BING_API_KEY, mapConfig.mode);
        break;
      case 'HereMap':
        this._mapProvider = new GEOTHREE.HereMapsProvider(mapConfig.APIKey || APIKeys.DEV_HEREMAPS_APP_ID, mapConfig.APICode || APIKeys.DEV_HEREMAPS_APP_CODE, mapConfig.mode, mapConfig.scheme, mapConfig.format, mapConfig.tileResolutionSize);
        break;
      case 'MapBoxMap':
      default:
        this._mapProvider = new GEOTHREE.MapBoxProvider(mapConfig.APIKey || APIKeys.DEV_MAPBOX_API_KEY, mapConfig.id || "mapbox/satellite-streets-v10", mapConfig.mode, mapConfig.format);
        break;
    }
  }

  public setLatLong(lat: number, long: number) {
    var coords = GEOTHREE.UnitsUtils.datumsToSpherical(lat, long);
    var bound = this._viewer.models[0].getModelBoundingBox();
    this._map.position.set(-coords.x, bound.min.y, coords.y);
    this._map.updateMatrixWorld(true);
  }

  public setMapProvider(provider: string, apiKey?: string) {
    const mapConfig = {
      provider: provider,
      APIKey: apiKey
    }
    this.getMapProvider(mapConfig);
    this._map.setProvider(this._mapProvider);
  }

  public dispose(): void {
    this._viewer.removeObject3D(this._map);
  }
}