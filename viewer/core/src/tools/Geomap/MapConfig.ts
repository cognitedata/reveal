/*!
 * Copyright 2021 Cognite AS
 */
import * as GEOTHREE from 'geo-three'; 
/**
 * Supported map API Keys
 */
export enum APIKeys {
DEV_MAPBOX_API_KEY = "",
OPEN_MAP_TILES_SERVER_MAP = "",
DEV_HEREMAPS_APP_ID = "",
DEV_HEREMAPS_APP_CODE = "",
DEV_BING_API_KEY = "",
DEV_MAPTILER_API_KEY = ""
}

/**
 * Map Configuration of {@link GeomapTool}.
 */
export type MapConfig = {
  /**
   * Map Provider
   */
  mapProvider: string;
  /**
   * Map Id or Style
   */
   id?: string;
  /**
   * Map View Mode
   */
  mapMode?: number;
  /**
   * Map provider API Key
   */
  mapAPIKey: string;
  /**
   * Map provider API Key
   */
   mapAPICode?: string;
  /**
   * Image format
   */
  format?: string;
  /**
   * Map Scheme
   */
  mapScheme?: string;
  /**
   * Map Tile Resolution Size
   */
  mapResSize?: number;
    /**
   * Map provider API Key
   */
  latlong?: LatLongPosition;
  /**
   * Is Vector Map?
   */
   isVectorMap?: boolean;
};

/**
 * Latitude, Longitude position.
*/
export type LatLongPosition = {
latitude: number;
longitude: number;
};