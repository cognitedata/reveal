/*!
 * Copyright 2021 Cognite AS
 */
/**
 * Supported map API Keys
 */
export enum APIKeys {
DEV_MAPBOX_API_KEY = "pk.eyJ1IjoicHJhbW9kLXMiLCJhIjoiY2tzb2JkbXdyMGd5cjJubnBrM3IwMTd0OCJ9.jA9US2D2FRXUlldhE8bZgA",
DEV_HEREMAPS_APP_ID = "HqSchC7XT2PA9qCfxzFq",
DEV_HEREMAPS_APP_CODE = "5rob9QcZ70J-m18Er8-rIA",
DEV_BING_API_KEY = "AuViYD_FXGfc3dxc0pNa8ZEJxyZyPq1lwOLPCOydV3f0tlEVH-HKMgxZ9ilcRj-T",
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