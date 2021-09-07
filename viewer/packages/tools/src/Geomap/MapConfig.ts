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
 * Supported map Providers Bing, Here & Mapbox
 */
export enum MapProviders {
  BINGMAP = 'BingMap',
  HEREMAP = 'HereMap',
  MAPBOXMAP = 'MapBoxMap'
}

/**
 * Map data for Mapbox
*/
export enum MapBoxMode {
  STYLE = 100,
  MAP_ID = 101
};

/**
 * Mapbox Map Style
*/
 export enum MapBoxStyle {
  STREETS = 'mapbox/streets-v10',
  OUTDOOR = 'mapbox/outdoors-v10',
  LIGHT = 'mapbox/light-v9',
  DARK = 'mapbox/dark-v9',
  SATELLITE = 'mapbox/satellite-v9',
  SATELLITE_STREETS = 'mapbox/satellite-streets-v10',
  NAVIGATION_DAY = 'mapbox/navigation-preview-day-v4',
  NAVIGATION_NIGHT = 'mapbox/navigation-preview-night-v4',
  NAVIGATION_GUIDE_DAY = 'mapbox/navigation-guidance-day-v4',
  NAVIGATION_GUIDE_NIGHT = 'mapbox/navigation-guidance-night-v4'
 }

 /**
 * Mapbox Map image tile format
 */
export enum MapBoxImageFormat {
  PNG = 'png',
  PNG32 = 'png32',
  PNG64 = 'png64',
  PNG128 = 'png128',
  PNG256 = 'png256',
  JPG70 = 'jpg70',
  JPG80 = 'jpg80',
  JPG90 = 'jpg90',
  PNGRAW = 'pngraw'
}

/**
 * Bing Map View (aerial, road, bird's eye view of the map)
 */
export enum BingMapType {
	AERIAL= 'a',
	ROAD = 'r',
	AERIAL_LABELS = 'h',
	OBLIQUE = 'o',
	OBLIQUE_LABELS = 'b'
}

/**
 * Bing Map Tile Image formats
 */
export enum BingMapImageFormat {
  GIF = 'gif',
  JPEG = 'jpeg',
  PNG = 'png'
}

/**
 * Here Map types
 */
export enum HereMapType {
  AERIAL = 'aerial',
	BASE = 'base',
	PANO = 'pano',
	TRAFFIC = 'traffic'
}

/**
 * Here Map View Scheme like day, night, satellite, terrain
 */
export enum HereMapScheme {
  DAY = 'normal.day',
	NIGHT = 'normal.night',
	TERRAIN = 'terrain.day',
	SATELLITE = 'satellite.day'
}

/**
 * Here Map Tiles Image Format
 */
export enum HereMapImageFormat {
  PNG = 'png',
	PNG8 = 'png8',
	JPG = 'jpg'
}

/**
 * Maps Configuration of {@link GeomapTool}.
 */
export type MapConfig = {
  /**
   * Map Provider
   */
  provider: string;
  /**
   * Map Id or Style
   */
  id?: string;
  /**
   * Map View Mode
   */
  mode?: number;
  /**
   * Map provider API Key
   */
  APIKey: string;
  /**
   * Map provider API Key
   */
  APICode?: string;
  /**
   * Image format
   */
  format?: string;
  /**
   * Map Scheme
   */
  scheme?: string;
  /**
   * Map Tile Resolution Size
   */
  tileResolutionSize?: number;
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