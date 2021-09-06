/*!
 * Copyright 2021 Cognite AS
 */

import * as GEOTHREE from 'geo-three';
import { Cognite3DViewer } from '@reveal/core';
import { APIKeys } from './MapConfig';

export class Geomap {

    private _viewer: Cognite3DViewer;
    private _map: any;
    private _mapProvider: any;

    public CreateMap(viewer: Cognite3DViewer, mapConfig: any) {
        this._viewer = viewer;
        this.GetMapProvider(mapConfig);
        this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, this._mapProvider, this._mapProvider);
        this._viewer.addObject3D(this._map);
    }

    private GetMapProvider(mapConfig: any) {
        switch(mapConfig.mapProvider) {
            case 'BingMap':
                this._mapProvider = new GEOTHREE.BingMapsProvider( mapConfig.mapAPIKey || APIKeys.DEV_BING_API_KEY, mapConfig.mapMode);
                break;
            case 'HereMap':
                this._mapProvider = new GEOTHREE.HereMapsProvider(mapConfig.mapAPIKey || APIKeys.DEV_HEREMAPS_APP_ID, mapConfig.mapAPICode || APIKeys.DEV_HEREMAPS_APP_CODE, mapConfig.mapMode, mapConfig.mapScheme, mapConfig.format, mapConfig.mapResSize);
                break;
            case 'MapBoxMap':
            default:
                this._mapProvider = new GEOTHREE.MapBoxProvider(mapConfig.mapAPIKey || APIKeys.DEV_MAPBOX_API_KEY, mapConfig.id || "mapbox/satellite-streets-v10", mapConfig.mapMode, mapConfig.format);
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
            mapProvider: provider,
            mapAPIKey: apiKey
        }
        this.GetMapProvider(mapConfig);
        this._map.setProvider(this._mapProvider);
    }

    public dispose(): void {
        this._viewer.removeObject3D(this._map);
    }
}