/*!
 * Copyright 2021 Cognite AS
 */

import * as GEOTHREE from 'geo-three';
import { Cognite3DViewer } from '@reveal/core';
import { MapboxStyle, MapConfig, MapProviders } from './MapConfig';
import { MapProvider, MapView } from 'geo-three';

export class Geomap {
  private readonly _viewer: Cognite3DViewer;
  private _map: MapView;

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
    let mapProvider: MapProvider;
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

  public setMapProvider(provider: MapProviders, apiKey: string, appCode?: string, id?: MapboxStyle) {
    const mapConfig: MapConfig = {
      provider: provider,
      APIKey: apiKey,
      appCode: appCode,
      id: id,
      latlong: {
        latitude: 0,
        longitude: 0
      }
    };
    const mapProvider = this.getMapProvider(mapConfig);
    this._map.setProvider(mapProvider);
  }

  public dispose(): void {
    this._viewer.removeObject3D(this._map);
  }
}
