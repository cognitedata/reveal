/*!
 * Copyright 2021 Cognite AS
 */
import * as GEOTHREE from 'geo-three';

import { Cognite3DViewer } from '../../migration';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import {
  MapConfig,
  DefaultMapConfig,
  APIKeys,
} from './MapConfig';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

export class GeomapTool extends Cognite3DViewerToolBase {

  private readonly _viewer: Cognite3DViewer;
  private readonly _mapConfig: Required<MapConfig>;

  private _map: GEOTHREE.MapView;

  private readonly _providers : { id : string, provider: GEOTHREE.MapProvider }[] = [
    {"id" : "Vector OpenSteet Maps", "provider" : new GEOTHREE.OpenStreetMapsProvider()},
    {"id" : "Vector OpenTile Maps", "provider" : new GEOTHREE.OpenMapTilesProvider(APIKeys.OPEN_MAP_TILES_SERVER_MAP)},
    {"id" : "Vector Map Box", "provider" : new GEOTHREE.MapBoxProvider(APIKeys.DEV_MAPBOX_API_KEY, "mapbox/streets-v10", GEOTHREE.MapBoxProvider.STYLE)},
    {"id" : "Vector Here Maps", "provider" : new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "base", "normal.day", "jpg", 512)},
    {"id" : "Vector Here Maps Night", "provider" : new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "base", "normal.night", "jpg", 512)},
    {"id" : "Vector Here Maps Terrain", "provider" : new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "aerial", "terrain.day", "jpg", 512)},
    {"id" : "Vector Bing Maps", "provider" : new GEOTHREE.BingMapsProvider(APIKeys.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.ROAD)},
    {"id" : "Vector Map Tiler Basic", "provider" : new GEOTHREE.MapTilerProvider(APIKeys.DEV_MAPTILER_API_KEY, "maps", "basic", "png")},
    {"id" : "Vector Map Tiler Outdoor", "provider" : new GEOTHREE.MapTilerProvider(APIKeys.DEV_MAPTILER_API_KEY, "maps", "outdoor", "png")},
    {"id" : "Satellite Map Box", "provider" : new GEOTHREE.MapBoxProvider(APIKeys.DEV_MAPBOX_API_KEY, "mapbox.satellite", GEOTHREE.MapBoxProvider.MAP_ID, "jpg70", false)},
    {"id" : "Satellite Map Box Labels", "provider" : new GEOTHREE.MapBoxProvider(APIKeys.DEV_MAPBOX_API_KEY, "mapbox/satellite-streets-v10", GEOTHREE.MapBoxProvider.STYLE, "jpg70")},
    {"id" : "Satellite Here Maps", "provider" : new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "aerial", "satellite.day", "jpg", 512)},
    {"id" : "Satellite Bing Maps", "provider" : new GEOTHREE.BingMapsProvider(APIKeys.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.AERIAL)},
    {"id" : "Satellite Maps Tiler Labels", "provider" : new GEOTHREE.MapTilerProvider(APIKeys.DEV_MAPTILER_API_KEY, "maps", "hybrid", "jpg")},
    {"id" : "Satellite Maps Tiler", "provider" : new GEOTHREE.MapTilerProvider(APIKeys.DEV_MAPTILER_API_KEY, "tiles", "satellite", "jpg")},
    {"id" : "Debug", "provider" : new GEOTHREE.DebugProvider()}
  ];

  constructor(viewer: Cognite3DViewer, config?: MapConfig) {
    super();

    this._viewer = viewer;
    this._mapConfig = merge(cloneDeep(DefaultMapConfig), config);
    this._map = new GEOTHREE.MapView(GEOTHREE.MapView.PLANAR, this._mapConfig.mapProvider, this._mapConfig.mapProvider);

    var coords = GEOTHREE.UnitsUtils.datumsToSpherical(this._mapConfig.latlong.latitude, this._mapConfig.latlong.longitude);
    var bound = this._viewer.models[0].getModelBoundingBox();
    this._map.position.set(-coords.x, bound.min.y, coords.y);
    this._viewer.addObject3D(this._map);
    this._map.updateMatrixWorld(true);
  }

  public setMapProvider(idx : number) {
    this._map.setProvider(this._providers[idx].provider);
  }

  public setLatLong(lat : number, long : number) {
    var coords = GEOTHREE.UnitsUtils.datumsToSpherical(lat, long);
    var bound = this._viewer.models[0].getModelBoundingBox();
    this._map.position.set(-coords.x, bound.min.y, coords.y);
    this._map.updateMatrixWorld(true);
  }

  public dispose(): void {
    super.dispose();
    this._viewer.removeObject3D(this._map);
  }
}
