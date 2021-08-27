/*!
 * Copyright 2021 Cognite AS
 */
import * as GEOTHREE from 'geo-three'; 
/**
 * Supported map API Keys
 */
export enum APIKeys {
DEV_MAPBOX_API_KEY = "pk.eyJ1IjoidGVudG9uZSIsImEiOiJjazBwNHU4eDQwZzE4M2VzOGhibWY5NXo5In0.8xpF1DEcT6Y4000vNhjj1g",
OPEN_MAP_TILES_SERVER_MAP = "",
DEV_HEREMAPS_APP_ID = "HqSchC7XT2PA9qCfxzFq",
DEV_HEREMAPS_APP_CODE = "5rob9QcZ70J-m18Er8-rIA",
DEV_BING_API_KEY = "AuViYD_FXGfc3dxc0pNa8ZEJxyZyPq1lwOLPCOydV3f0tlEVH-HKMgxZ9ilcRj-T",
DEV_MAPTILER_API_KEY = "B9bz5tIKxl4beipiIbR0"
}

/**
 * Map Configuration of {@link GeomapTool}.
 */
export type MapConfig = {
  /**
   * Map Provider
   */
  mapProvider?: GEOTHREE.MapProvider;
  /**
   * Map View Mode
   */
  mapMode?: number
  /**
   * Map provider API Key
   */
  mapAPIKey?: string;
    /**
   * Map provider API Key
   */
  latlong?: LatLongPosition;
};

/**
 * Latitude, Longitude position.
*/
export type LatLongPosition = {
latitude: number;
longitude: number;
};

/**
 * Default map configuration
 */
export const DefaultMapConfig: Required<MapConfig> = {
    mapProvider: new GEOTHREE.MapBoxProvider(APIKeys.DEV_MAPBOX_API_KEY, "mapbox/satellite-streets-v10", GEOTHREE.MapBoxProvider.STYLE, "jpg70"),
    mapMode: GEOTHREE.MapView.PLANAR,
    mapAPIKey: APIKeys.DEV_MAPBOX_API_KEY,
    latlong: {
        latitude: 59.9016426931744,
        longitude: 10.607235872426175
    }
};

/**
 * Bing map configuration
*/
    export const BingMapConfig: Required<MapConfig> = {
    mapProvider: new GEOTHREE.BingMapsProvider(APIKeys.DEV_BING_API_KEY, GEOTHREE.BingMapsProvider.AERIAL),
    mapMode: GEOTHREE.MapView.PLANAR,
    mapAPIKey: APIKeys.DEV_BING_API_KEY,
    latlong: {
        latitude: 59.9016426931744,
        longitude: 10.607235872426175
    }
};

/**
 * Here map configuration
*/
export const HereMapConfig: Required<MapConfig> = {
    mapProvider: new GEOTHREE.HereMapsProvider(APIKeys.DEV_HEREMAPS_APP_ID, APIKeys.DEV_HEREMAPS_APP_CODE, "aerial", "satellite.day", "jpg", 512),
    mapMode: GEOTHREE.MapView.PLANAR,
    mapAPIKey: APIKeys.DEV_HEREMAPS_APP_ID,
    latlong: {
        latitude: 59.9016426931744,
        longitude: 10.607235872426175
    }
};