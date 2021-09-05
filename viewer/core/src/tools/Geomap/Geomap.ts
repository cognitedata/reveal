/*!
 * Copyright 2021 Cognite AS
 */

import * as GEOTHREE from 'geo-three';
import { Cognite3DViewer } from '../../migration';
import { APIKeys } from './MapConfig';

export class Geomap {

    private _viewer: Cognite3DViewer;
    private _map: any;
    private _mapProvider: any;

    private readonly _providers : { id : string, provider: GEOTHREE.MapProvider }[] = [
        {"id" : "Vector OpenSteet Maps", "provider" : new GEOTHREE.OpenStreetMapsProvider()},
        {"id" : "Vector Map Box", "provider" : new GEOTHREE.MapBoxProvider(APIKeys.DEV_MAPBOX_API_KEY, "mapbox/streets-v10", GEOTHREE.MapBoxProvider.STYLE)},
        {"id" : "Vector Here Maps", "provider" : new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "base", "normal.day", "jpg", 512)},
        {"id" : "Vector Bing Maps", "provider" : new GEOTHREE.BingMapsProvider(APIKeys.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.ROAD)},
        {"id" : "Vector Map Tiler Outdoor", "provider" : new GEOTHREE.MapTilerProvider(APIKeys.DEV_MAPTILER_API_KEY, "maps", "outdoor", "png")},
        {"id" : "Satellite Map Box Labels", "provider" : new GEOTHREE.MapBoxProvider(APIKeys.DEV_MAPBOX_API_KEY, "mapbox/satellite-streets-v10", GEOTHREE.MapBoxProvider.STYLE, "jpg70")},
        {"id" : "Satellite Here Maps", "provider" : new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "aerial", "satellite.day", "jpg", 512)},
        {"id" : "Satellite Bing Maps", "provider" : new GEOTHREE.BingMapsProvider(APIKeys.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.AERIAL)},
        {"id" : "Satellite Maps Tiler Labels", "provider" : new GEOTHREE.MapTilerProvider(APIKeys.DEV_MAPTILER_API_KEY, "maps", "hybrid", "jpg")},
        {"id" : "Debug", "provider" : new GEOTHREE.DebugProvider()}
      ];

    public CreateMap(viewer: Cognite3DViewer, mapConfig: any) {
        this._viewer = viewer;
        this.GetMapProvider(mapConfig);
        this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, this._mapProvider, this._mapProvider);
        this._viewer.addObject3D(this._map);
    }

    private GetMapProvider(mapConfig: any) {
        switch(mapConfig.mapProvider) {
            case 'BingMap':
                this._mapProvider = new GEOTHREE.BingMapsProvider(mapConfig.mapAPIKey, mapConfig.mapMode);
                break;
            case 'HereMap':
                this._mapProvider = new GEOTHREE.HereMapsProvider(mapConfig.mapAPIKey, mapConfig.mapAPICode, mapConfig.mapMode, mapConfig.mapScheme, mapConfig.format, mapConfig.mapResSize);
                break;
            case 'MapTilerMap':
                this._mapProvider = new GEOTHREE.MapTilerProvider(mapConfig.mapAPIKey, mapConfig.mapMode, mapConfig.mapMode, mapConfig.format);
                break;
            case 'OpenStreetMap':
                this._mapProvider = new GEOTHREE.OpenStreetMapsProvider();
                break;
            case 'MapBoxMap':
            default:
                this._mapProvider = new GEOTHREE.MapBoxProvider(mapConfig.mapAPIKey, mapConfig.id, mapConfig.mapMode, mapConfig.format);
                break;
        }
    }

    public setLatLong(lat: number, long: number) {
        var coords = GEOTHREE.UnitsUtils.datumsToSpherical(lat, long);
        var bound = this._viewer.models[0].getModelBoundingBox();
        this._map.position.set(-coords.x, bound.min.y, coords.y);
        this._map.updateMatrixWorld(true);
    }

    public setMapProvider(idx: number) {
        this._map.setProvider(this._providers[idx].provider);
    }

    public dispose(): void {
        this._viewer.removeObject3D(this._map);
    }
}