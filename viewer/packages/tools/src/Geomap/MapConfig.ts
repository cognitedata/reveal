/*!
 * Copyright 2021 Cognite AS
 */

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
  /**
   * Access the map data using a map style.
   */
  STYLE = 100,
  /**
   * Access the map data using a map id.
   */
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

export type BingMapConfig = {
  /**
   * The type of the map used.
   */
  type?: BingMapType;
};

export type HereMapConfig = {
  /**
   * Service application code token.
   */
  appCode?: string;
  /**
   * The type of maps to be used.
   */
  style?: HereMapType;
  /**
   * Specifies the view scheme
   */
  scheme?: string;
  /**
   * Map image tile format
   */
  imageFormat?: HereMapImageFormat;
  /**
   * Returned tile map image size.
   * The following sizes are supported:
   *  - 256
   *  - 512
   *  - 128 (deprecated, although usage is still accepted)
   */
  size?: number;
};

export type MapBoxConfig = {
  /**
   * Map style or map ID if the mode is set to MAP_ID
   */
  id?: MapBoxStyle;
  /**
   * Map tile access mode
   *  - MapBoxMode.STYLE
   *  - MapBoxMode.MAP_ID
   */
  mode?: MapBoxMode;
  /**
   * Map image tile format
   */
  tileFormat?: MapBoxImageFormat;
  /**
   * Flag to indicate if should use high resolution tiles
   */
  useHDPI?: boolean;
};

/**
 * Maps Configuration of {@link GeomapTool}.
 */
export type MapConfig = BingMapConfig & HereMapConfig & MapBoxConfig & {
  /**
   * Map Provider
   */
  provider: string;
  /**
   * Map provider API Key
   */
  APIKey: string;
  /**
   * Latitude, Longitude position
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